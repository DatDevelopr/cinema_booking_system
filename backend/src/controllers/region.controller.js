const { Region } = require("../models");

exports.getAllRegions = async (req, res) => {
  const regions = await Region.findAll();
  res.json(regions);
};

exports.createRegion = async (req, res) => {
  const { region_name } = req.body;
  const region = await Region.create({ region_name });
  res.status(201).json(region);
};
