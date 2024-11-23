import { check, body, validationResult } from "express-validator";
import apiResponse from "../helpers/apiResponse.js";
import MongooseBikeManager from '../managers/MongooseBikeManager.js';

class BikesApiController {
	constructor() {
		this.BikeManager = new MongooseBikeManager();
	}

	includeData(data) {
		return {
			id: data.id,
			name: data.name,
			manufacturer: data.manufacturer,
			year: data.year,
			createdAt: data.createdAt,
		}
	}

	list = async (req, res) => {
		try {
			const allBikes = await this.BikeManager.fetchBikes(req.user);
			if (allBikes.length > 0) {
				const bikes = allBikes.map(document => this.includeData(document));
				return apiResponse.successResponseWithData(res, "Operation success", bikes);
			} else {
				return apiResponse.successResponseWithData(res, "Operation success", []);
			}
		} catch (err) {
			return apiResponse.errorResponse(res, err);
		}
	}

	detail = async (req, res) => {
		try {
			const bikes = await this.BikeManager.getBikeById(req.user, req.params.id);

			if (bikes !== null) {
				let bikeData = this.includeData(bikes);
				return apiResponse.successResponseWithData(res, "Operation success", bikeData);
			} else {
				return apiResponse.successResponseWithData(res, "Operation success", {});
			}
		} catch (err) {
			return apiResponse.errorResponse(res, err);
		}
	}

	create = [
		check("name", "Name must not be empty.").isLength({ min: 1 }).trim(),
		check("manufacturer", "Manufacturer must not empty.").notEmpty().trim(),
		check("year", "Year must not be empty.").notEmpty().isNumeric(),
		body("*").escape(),
		async (req, res) => {
			try {
				const errors = validationResult(req);
				if (!errors.isEmpty()) {
					return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
				} else {
					const createdBike = await this.BikeManager.addBike(req.user, req.body.name, req.body.manufacturer, req.body.year);
					if (!createdBike) {
						return apiResponse.errorResponse(res, 'Could not create bike');
					} else {
						let bikeData = this.includeData(createdBike);
						return apiResponse.successResponseWithData(res, "Bike add Success.", bikeData);
					};
				}
			} catch (err) {
				return apiResponse.errorResponse(res, err);
			}
		}
	]

	update = [
		check("name", "Name must not be empty.").isLength({ min: 1 }).trim(),
		check("manufacturer", "Manufacturer must not empty.").notEmpty().trim(),
		check("year", "Year must not be empty.").notEmpty().isNumeric(),
		body("*").escape(),
		async (req, res) => {
			try {
				const errors = validationResult(req);
				if (!errors.isEmpty()) {
					return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
				} else {
					const foundBike = await this.BikeManager.getBikeById(req.user, req.params.id);

					if (foundBike === null) {
						return apiResponse.notFoundResponse(res, "Bike not exists with this id or You are not authorized ");
					} else {
						const bike = {
							name: req.body.name,
							manufacturer: req.body.manufacturer,
							year: req.body.year,
							id: req.params.id
						};

						const updatedBike = await this.BikeManager.changeBike(req.user, bike);
						if (!updatedBike) {
							return apiResponse.errorResponse(res, 'Could not update bike');
						} else {
							let bikeData = this.includeData(bike);
							return apiResponse.successResponseWithData(res, "Bike update Success.", bikeData);
						}
					}
				}
			} catch (err) {
				return apiResponse.errorResponse(res, err);
			}
		}
	]

	delete = [
		async (req, res) => {
			try {
				const foundBike = await this.BikeManager.getBikeById(req.user, req.params.id);
				if (foundBike === null) {
					return apiResponse.notFoundResponse(res, "Bike not exists with this id");
				} else {
					const removedBike = await this.BikeManager.removeBike(req.user, req.params.id);
					if (!removedBike) {
						return apiResponse.errorResponse(res, 'Could not delete the bike');
					} else {
						return apiResponse.successResponse(res, "Bike delete Success.");
					}

				}

			} catch (err) {
				return apiResponse.errorResponse(res, err);
			}
		}
	]
}

export default BikesApiController;
