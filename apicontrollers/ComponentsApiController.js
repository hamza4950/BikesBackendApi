import { check, body, validationResult } from "express-validator";
import apiResponse from "../helpers/apiResponse.js";
import MongooseComponentManager from '../managers/MongooseComponentManager.js';
import MongooseBikeManager from '../managers/MongooseBikeManager.js';

class ComponentsApiController {
	constructor() {
		this.ComponentModel = new MongooseComponentManager();
		this.BikeManager = new MongooseBikeManager();
	}

	includeData(data) {
		return {
			id: data.id,
			name: data.name,
			manufacturer: data.manufacturer,
			price: data.price,
			quality: data.quality,
			createdAt: data.createdAt,
		}
	}

	list = async (req, res) => {
		try {

			const bike = await this.BikeManager.getBikeById(req.user, req.params.bikeId);
			if (!bike) {
				return apiResponse.notFoundResponse(res, "Bike not exists with this id");
			}

			const allComponents = await this.ComponentModel.fetchComponents(bike);
			if (allComponents.length > 0) {
				const components = allComponents.map(document => this.includeData(document));
				return apiResponse.successResponseWithData(res, "Operation success", components);
			} else {
				return apiResponse.successResponseWithData(res, "Operation success", []);
			}
		} catch (err) {
			return apiResponse.errorResponse(res, err);
		}
	}

	detail = async (req, res) => {
		try {


			const component = await this.ComponentModel.getComponentById(req.params.componentId);

			if (component !== null) {
				let componentData = this.includeData(component);
				return apiResponse.successResponseWithData(res, "Operation success", componentData);
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
		check("price", "price must not be empty.").notEmpty().isNumeric(),
		check("quality", "Quality must not be empty.").optional().trim(),

		async (req, res) => {
			try {

				// console.log(req.body)

				const errors = validationResult(req);
				if (!errors.isEmpty()) {
					return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
				} else {

					

					const foundBike = await this.BikeManager.getBikeById(req.user, req.params.bikeId);

					console.log(foundBike)

					if (!foundBike) {
						return apiResponse.notFoundResponse(res, "Bike not exists with this id");
					}

					const createdComponent = await this.ComponentModel.addComponent(foundBike, req.body.name, req.body.manufacturer, req.body.price, req.body.quality);
					if (!createdComponent) {
						return apiResponse.errorResponse(res, 'Could not create component');
					} else {
						let componentData = this.includeData(createdComponent);
						return apiResponse.successResponseWithData(res, "Component add Success.", componentData);
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
		check("price", "Price must not be empty.").notEmpty().isNumeric(),
		check("quality", "Quality must not be empty.").optional().trim(),
		body("*").escape(),
		async (req, res) => {
			try {
				const errors = validationResult(req);
				if (!errors.isEmpty()) {
					return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
				} else {
					const foundComponent = await this.ComponentModel.getComponentById(req.params.componentId);

					if (foundComponent === null) {
						return apiResponse.notFoundResponse(res, "Component not exists with this id or You are not authorized ");
					} else {
						const component = {
							name: req.body.name,
							manufacturer: req.body.manufacturer,
							price: req.body.price,
							quality: req.body.quality,
							id: req.params.componentId
						};

						const updatedComponent = await this.ComponentModel.changeComponent(component);
						if (!updatedComponent) {
							return apiResponse.errorResponse(res, 'Could not update component');
						} else {
							let componentData = this.includeData(component);
							return apiResponse.successResponseWithData(res, "Component update Success.", componentData);
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
				const foundComponent = await this.ComponentModel.getComponentById(req.params.componentId);
				if (foundComponent === null) {
					return apiResponse.notFoundResponse(res, "Component not exists with this id");
				} else {
					const removedComponent = await this.ComponentModel.removeComponent(req.params.componentId);
					if (!removedComponent) {
						return apiResponse.errorResponse(res, 'Could not delete the component');
					} else {
						return apiResponse.successResponse(res, "Component delete Success.");
					}

				}

			} catch (err) {
				return apiResponse.errorResponse(res, err);
			}
		}
	]
}

export default ComponentsApiController;
