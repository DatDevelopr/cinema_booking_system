const { Cinema, Region } = require("../models");

exports.getAllCinemas = async (req, res) => {
  const cinemas = await Cinema.findAll({
    include: [{ model: Region, attributes: ["region_name"] }],
  });
  res.json(cinemas);
};

exports.getCinemaByRegion = async (req, res) => {
  const { region_id } = req.query;
  const cinemas = await Cinema.findAll({ where: { region_id } });
  res.json(cinemas);
};

exports.createCinema = async (req, res) => {
  const cinema = await Cinema.create(req.body);
  res.status(201).json(cinema);
};
