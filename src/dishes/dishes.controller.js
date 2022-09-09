const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//create, read, update, and list

function list(req, res, next) {
  res.json({ data: dishes });
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

function priceIsValid(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: `price requires a valid number`,
    });
  }
  next();
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  return res.status(201).json({ data: newDish });
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (!foundDish) {
    return next({
      status: 404,
      message: `Dish not found ${dishId}`,
    });
  }
  res.locals.dish = foundDish;
  next();
}

function idMatches(req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;
  if (!id || id.length === 0 || dishId == id) {
    next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

function update(req, res) {
  const dish = res.locals.dish;
  const { data: { name, description, price, image_url } = {} } = req.body;

  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish });
}

module.exports = {
  list,
  read: [dishExists, read],
  create: [
    bodyDataHas("name"),
    bodyDataHas("price"),
    bodyDataHas("description"),
    bodyDataHas("image_url"),
    priceIsValid,
    create,
  ],
  update: [
    dishExists,
    idMatches,
    bodyDataHas("name"),
    bodyDataHas("price"),
    bodyDataHas("description"),
    bodyDataHas("image_url"),
    priceIsValid,
    update,
  ],
};
