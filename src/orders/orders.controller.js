const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//create, read, update, delete, and list orders.

function list(req, res) {
  res.json({ data: orders });
}

function read(req, res) {
  res.json({ data: res.locals.order });
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

function update(req, res) {
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;

  res.status(200).json({ data: order });
}

function orderExists(req, res, next) {
  const { orderId } = req.params;

  const foundOrder = orders.find((order) => order.id == orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    next();
  }
  next({
    status: 404,
    message: `Order does not exist: ${orderId}`,
  });
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

function idMatches(req, res, next) {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;
  if (!id || id.length === 0 || orderId == id) {
    next();
  }
  next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
  });
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

function statusPropertyIsValid(req, res, next) {
  const { data: { status } = {} } = req.body;
  const validStatus = ["out-for-delivery", "pending", "delivered", "preparing"];
  if (validStatus.includes(status)) {
    next();
  }
  next({
    status: 400,
    message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
  });
}

function remove(req, res, next) {
  if (res.locals.order.status !== "pending") {
    return next({
      status: 400,
      message: `Only a pending order can be removed!`,
    });
  }
  const index = orders.indexOf(res.locals.order);
  orders.splice(index, 1);
  res.sendStatus(204).json({ data: res.locals.order });
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
  read: [orderExists, read],
  update: [
    orderExists,
    idMatches,
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    bodyDataHas("status"),
    orderHasOneDish,
    dishQuantityIsValid,
    statusPropertyIsValid,
    update,
  ],
  delete: [orderExists, remove],
};
