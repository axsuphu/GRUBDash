const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: orders });
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({
      status: 400,
      message: `Must include a ${propertyName}`,
    });
  };
}

function orderHasOneDish(req, res, next) {
  const {
    data: { dishes },
  } = req.body;
  if (!Array.isArray(dishes) || dishes.length === 0) {
    next({
      status: 400,
      message: `order must include at least one dish`,
    });
  }
  return next();
}

function dishQuantityIsValid(req, res, next) {
  const {
    data: { dishes },
  } = req.body;
  dishes.forEach(({ quantity }, index) => {
    if (quantity && typeof quantity === "number" && quantity > 0) {
      null;
    } else {
      next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });
  next();
}

function create(req, res) {
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

module.exports = {
  list,
  create: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    orderHasOneDish,
    dishQuantityIsValid,
    create,
  ],
};
