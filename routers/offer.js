const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");

const User = require("../models/User");
const Offer = require("../models/Offer");
const cloudinary = require("cloudinary").v2;

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      condition,
      city,
      brand,
      size,
      color,
      picture,
    } = req.fields;
    newOffer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        {
          MARQUE: req.fields.brand,
        },
        {
          TAILLE: req.fields.size,
        },
        {
          ÉTAT: req.fields.condition,
        },
        {
          COULEUR: req.fields.color,
        },
        {
          EMPLACEMENT: req.fields.city,
        },
      ],
      owner: req.user,
    });
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: `/vinted-pegasus21/offers/${newOffer._id}`,
    });
    newOffer.product_image = result;
    await newOffer.save();
    res.status(200).json(newOffer);
  } catch (error) {
    console.error(error.message);
  }
});

router.get("/offers", async (req, res) => {
  try {
    //Query Parameters to filter by title,priceMin,priceMax
    const filter = {};
    if (req.query.title) {
      filter.product_name = new RegExp(req.query.title, "i");
    }
    if (req.query.prixMin) {
      filter.product_price = { $gte: Number(req.query.prixMin) };
    }

    //Query Parameters to sort by price-desc and price-asc
    const sort = {};
    if (req.query.sort === "price-desc") {
      sort = { product_price: -1 };
    } else if (req.query.sort === "price-asc") {
      sort = { product_price: 1 };
    }

    let limit = Number(req.query.limit);
    if (!limit) {
      limit = 20;
    }

    let page;
    if (!req.query.page || Number(req.query.page) < 1) {
      page = 1;
    } else {
      page = Number(req.query.page);
    }

    // let skip = (page - 1) * limit;
    // console.log(skip);

    const offers = await Offer.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select("product_name product_price");
    const count = await Offer.countDocuments(filter);
    res.status(200).json({ count: count, offers: offers });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(404).json({ Information: "Page not Found" });
    } else {
      const id = await Offer.findById(req.params.id).populate({
        path: "owner",
        select: "account email",
      });

      res.status(200).json(id);
    }
  } catch (error) {
    console.error(error.message);
  }
});

module.exports = router;
