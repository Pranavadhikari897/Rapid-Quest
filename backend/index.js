
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
mongoose.connect('mongodb+srv://db_user_read:LdmrVA5EDEv4z3Wr@cluster0.n10ox.mongodb.net/RQ_Analytics', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log('Failed to connect to MongoDB', err));

const Customer = require('./models/customer');
const Product = require('./models/product');
const Order = require('./models/order');

const router = express.Router();
router.get('/customers', async (req, res) => {
  try {
    const customers = await Customer.find({});
    if (customers.length === 0) return res.status(404).json({ message: 'No customers found' });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    if (products.length === 0) return res.status(404).json({ message: 'No products found' });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({});
    if (orders.length === 0) return res.status(404).json({ message: 'No orders found' });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

// Total Sales Over Time
router.get('/sales-over-time', async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      {
        $addFields: {
          createdAtDate: {
            $dateFromString: { dateString: "$created_at" }
          }
        }
      },
      {
        $facet: {
          daily: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAtDate" },
                  month: { $month: "$createdAtDate" },
                  day: { $dayOfMonth: "$createdAtDate" }
                },
                totalSales: { $sum: { $toDouble: "$total_price_set.shop_money.amount" } }
              }
            },
            {
              $project: {
                _id: 0,
                date: {
                  $dateToString: { format: "%Y-%m-%d", date: {
                    $dateFromParts: {
                      year: "$_id.year",
                      month: "$_id.month",
                      day: "$_id.day"
                    }
                  }}
                },
                totalSales: 1
              }
            },
            { $sort: { "date": 1 } }
          ],
          monthly: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAtDate" },
                  month: { $month: "$createdAtDate" }
                },
                totalSales: { $sum: { $toDouble: "$total_price_set.shop_money.amount" } }
              }
            },
            {
              $project: {
                _id: 0,
                date: {
                  $dateToString: { format: "%Y-%m", date: {
                    $dateFromParts: {
                      year: "$_id.year",
                      month: "$_id.month",
                      day: 1
                    }
                  }}
                },
                totalSales: 1
              }
            },
            { $sort: { "date": 1 } }
          ],
          quarterly: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAtDate" },
                  quarter: { $ceil: { $divide: [{ $month: "$createdAtDate" }, 3] } }
                },
                totalSales: { $sum: { $toDouble: "$total_price_set.shop_money.amount" } }
              }
            },
            {
              $project: {
                _id: 0,
                date: {
                  $concat: [
                    { $toString: "$_id.year" },
                    "-Q",
                    { $toString: "$_id.quarter" }
                  ]
                },
                totalSales: 1
              }
            },
            { $sort: { "date": 1 } }
          ],
          yearly: [
            {
              $group: {
                _id: { year: { $year: "$createdAtDate" } },
                totalSales: { $sum: { $toDouble: "$total_price_set.shop_money.amount" } }
              }
            },
            {
              $project: {
                _id: 0,
                date: { $toString: "$_id.year" },
                totalSales: 1
              }
            },
            { $sort: { "date": 1 } }
          ]
        }
      }
    ]); 

    res.json(salesData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



  

// 2. Sales Growth Rate Over Time



router.get('/sales-growth-rate', async (req, res) => {
    try {
      const salesData = await Order.aggregate([
        {
          $addFields: {
            createdAtDate: {
              $dateFromString: { dateString: "$created_at" }
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAtDate" },
              month: { $month: "$createdAtDate" }
            },
            totalSales: { $sum: "$total_price_set" }
          }
        },

        {
          $sort: { "_id.year": 1, "_id.month": 1 }
        },
        
        {
          $setWindowFields: {
            sortBy: { "_id.year": 1, "_id.month": 1 },
            output: {
              prevTotalSales: {
                $shift: { output: "$totalSales", by: -1 }
              }
            }
          }
        },
        {
          $project: {
            date: { $dateToString: { format: "%Y-%m", date: { $dateFromParts: { year: "$_id.year", month: "$_id.month" } } } },
            growthRate: {
              $cond: {
                if: { $eq: ["$prevTotalSales", 0] },
                then: "Infinity", 
                else: {
                  $subtract: [
                    { $divide: [
                        { $subtract: ["$totalSales", "$prevTotalSales"] },
                        "$prevTotalSales"
                      ]
                    },
                    1
                  ]
                }
              }
            }
          }
        }
      ]);
  
      res.json({ data: salesData });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  




// 3. New Customers Added Over Time


router.get('/new-customers', async (req, res) => {
    try {
      const newCustomersData = await Customer.aggregate([
        
        {
          $addFields: {
            createdAtDate: {
              $dateFromString: { dateString: "$created_at" }
            }
          }
        },
        
        {
          $group: {
            _id: {
              year: { $year: "$createdAtDate" },
              month: { $month: "$createdAtDate" }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 }
        },
        {
          $project: {
            date: { $dateToString: { format: "%Y-%m", date: { $dateFromParts: { year: "$_id.year", month: "$_id.month" } } } },
            count: 1
          }
        }
      ]);
  
      res.json({ data: newCustomersData });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
   






// 4. Number of Repeat Customers


router.get('/repeat-customers/daily', async (req, res) => {
  try {
    const results = await Order.aggregate([
      {
        $match: {
          created_at: { $ne: null }
        }
      },
      {
        $project: {
          _id: 0,
          customerId: "$customer_id",
          createdAt: {
            $dateFromString: {
              dateString: "$created_at",
              timezone: "UTC"
            }
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
            customerId: "$customerId"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day"
          },
          repeatCustomerCount: { $sum: {
            $cond: { if: { $gte: ["$count", 2] }, then: 1, else: 0 }
          }}
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day"
                }
              }
            }
          },
          repeatCustomerCount: 1
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    res.json({ data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





router.get('/repeat-customers/monthly', async (req, res) => {
  try {
    const results = await Order.aggregate([
      {
        $match: {
          created_at: { $ne: null }
        }
      },
      {
        $project: {
          _id: 0,
          customerId: "$customer_id",
          createdAt: {
            $dateFromString: {
              dateString: "$created_at",
              timezone: "UTC"
            }
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            customerId: "$customerId"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month"
          },
          repeatCustomerCount: { 
            $sum: {
              $cond: { if: { $gte: ["$count", 2] }, then: 1, else: 0 }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%Y-%m",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month"
                }
              }
            }
          },
          repeatCustomerCount: 1
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    res.json({ data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/repeat-customers/monthly', async (req, res) => {
  try {
      const results = await getRepeatCustomers({
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
      });
      res.json({ data: results });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


router.get('/repeat-customers/quarterly', async (req, res) => {
  try {
    const results = await Order.aggregate([
      {
        $match: {
          created_at: { $ne: null }
        }
      },
      {
        $project: {
          _id: 0,
          customerId: "$customer_id",
          createdAt: {
            $dateFromString: {
              dateString: "$created_at",
              timezone: "UTC"
            }
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } },
            customerId: "$customerId"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            quarter: "$_id.quarter"
          },
          repeatCustomerCount: { $sum: {
            $cond: { if: { $gte: ["$count", 2] }, then: 1, else: 0 }
          }}
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $concat: [
              { $toString: "$_id.year" },
              "-Q",
              { $toString: "$_id.quarter" }
            ]
          },
          repeatCustomerCount: 1
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    res.json({ data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/repeat-customers/yearly', async (req, res) => {
  try {
    const results = await Order.aggregate([
      {
        $match: {
          created_at: { $ne: null }
        }
      },
      {
        $project: {
          _id: 0,
          customerId: "$customer_id",
          createdAt: {
            $dateFromString: {
              dateString: "$created_at",
              timezone: "UTC"
            }
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            customerId: "$customerId"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.year",
          repeatCustomerCount: { $sum: {
            $cond: { if: { $gte: ["$count", 2] }, then: 1, else: 0 }
          }}
        }
      },
      {
        $project: {
          _id: 0,
          date: { $toString: "$_id" },
          repeatCustomerCount: 1
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    res.json({ data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Geographical Distribution of Customers
router.get('/customer-distribution', async (req, res) => {
  try {
    const customerDistribution = await Customer.aggregate([
      {
        $group: {
          _id: "$default_address.city",
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(customerDistribution);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Customer Lifetime Value by Cohorts
router.get('/lifetime-value', async (req, res) => {
  try {
    const cohortData = await Order.aggregate([
      {
        $addFields: {
          createdAtDate: {
            $dateFromString: { dateString: "$created_at" }
          }
        }
      },
   
      {
        $addFields: {
          totalSpentNumeric: { $toDouble: "$total_spent" }
        }
      },
      
      {
        $group: {
          _id: {
            customerId: "$customer_id",
            cohortMonth: {
              $dateToString: { format: "%Y-%m", date: "$createdAtDate" }
            }
          },
          totalValue: { $sum: "$totalSpentNumeric" }
        }
      },
      {
        $group: {
          _id: "$_id.cohortMonth",
          totalLifetimeValue: { $sum: "$totalValue" }
        }
      },
    
      {
        $sort: { "_id": 1 }
      },
      
      {
        $project: {
          cohortMonth: "$_id",
          totalLifetimeValue: 1
        }
      }
    ]);

    res.json({ data: cohortData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api', router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});















