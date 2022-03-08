const Product = require('../models/product');
const Cart = require('../models/cart');


exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.json(products)
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1
  const limit = 2
  const offset = (page - 1) * limit
  let totalItems 

  Product.findAndCountAll()
      .then(numProducts => {
        totalItems = numProducts.count
        return Product.findAll({offset: offset, limit: limit})
      })
      .then(products => {
        res.render('shop/index', {
          prods: products,
          pageTitle: 'Shop',
          path: '/',
          currentPage: page,
          hasNextPage: limit * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / limit)
        });
      })
      .catch(err => {
        console.log(err);
      });
};

exports.getCart = (req, res, next) => {
  const page = +req.query.page || 1
  const limit = 2
  const offset = (page-1) * limit
  let totalItems
  let cartContainer

  req.user
  .getCart()
  .then(cart => {
    cartContainer = cart
    return cart.getProducts()
  })
  .then(numProducts => {
      totalItems = numProducts.length
      return cartContainer.getProducts({limit: limit, offset: offset})
  })
  .then(products => {
      res.json({
        products: products,
        currentPage: page,
        hasPreviousPage: page > 1,
        hasNextPage: (page*limit) < totalItems,
        previousPage: page-1,
        nextPage: page+1,
        lastPage: Math.ceil(totalItems / limit),
        totalItems: totalItems
      })
  })
  .catch(err => console.log(err))
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  
  let fetchedCart
  let newQuantity = 1
  req.user.getCart()
  .then(cart => {
    fetchedCart = cart
    return cart.getProducts({where: {id: prodId}})
  })
  .then( products => {
    let product
    if(products.length > 0){
      product = products[0]
    }
    if(product) {
      const oldQuantity = product.cartItem.quantity
      newQuantity = oldQuantity+1
      return product
    }
    return Product.findByPk(prodId)
  })
  .then((product) => {
    return fetchedCart.addProduct(product, { through: { quantity: newQuantity}})
  })
  .then(() => {
    res.redirect('/cart')
  })
  .catch(err => console.log(err))
};

exports.postCartDeleteProduct = (req, res, next) => {
  if(req.query.deleteAll){
    console.log('purchase called')
    req.user.getCart()
    .then(cart => {
      return cart.getProducts()
    })
    .then(products => {
      for(let product of products){
        product.cartItem.destroy()
      }
    })
    .then(_ => {
      res.status(201).send('operation successful');
    })
    .catch(err => console.log(err))
  }else {
    const prodId = req.body.productId;

    req.user.getCart()
    .then(cart => {
      return cart.getProducts({ where: {id: prodId}})
    })
    .then(products => {
      const product = products[0]
      return product.cartItem.destroy()
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err))
  }
};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
