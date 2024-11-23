import chalk from 'chalk';
import Bike from '../models/BikeModel.js';

class MongooseBikeManager {
    constructor() {
        this.BikeModel = Bike;
    }

    async initialize(app = null) {

        return true;
    }

    async fetchBikes(user) {
        try {
           
            const allBikesBelongingToUser = await this.BikeModel.find({ belongsTo: user.id });
           
            const allBikeObjects = allBikesBelongingToUser.map(element => {
                return element.toObject()
            })
            console.log(chalk.blueBright.inverse('All bikes loaded'));
            return allBikeObjects
        } catch (e) {
            console.log(chalk.blueBright.inverse('Empty bikes loaded'));
            return []
        }
    }

    async addBike(user, name, manufacturer, year) {
    
        if (user) {
   
            const newBike = {
                name, 
                manufacturer, 
                year,
                belongsTo: user.id
            };
            
            const addedBikeDocument = await this.BikeModel.create(newBike);

            if (addedBikeDocument) {
                console.log(chalk.green.inverse('New bike added!'));
                const savedBike = addedBikeDocument.toObject();
                return savedBike;
            } else
                console.log(chalk.red.inverse('Error in db creating the new bike!'))

        } else
            console.log(chalk.red.inverse('No user given!'))

        return null;

    }

    async removeBike(user, id) {
      
        const selectedBikeById = await this.BikeModel.findById(id).populate('belongsTo');

        if (selectedBikeById) {
            
            if (selectedBikeById.belongsTo.id == user.id) {
                const removedBikeDocument = await this.BikeModel.findByIdAndDelete(id);
                console.log(chalk.green.inverse('Bike removed!' + removedBikeDocument));
                return removedBikeDocument.toObject();
            } else {
                console.log(chalk.red.inverse(`Bike id and user do not correlate! No deletion made!`))
                return null;
            }
        } else {
            console.log(chalk.red.inverse(`No bike found with id = ${id} !`))
            return null;
        }
    }

    
    async changeBike(user, bike) {


        const bikeToChangeDocument = await this.BikeModel.findOne({ _id: bike.id, belongsTo: user.id });

        if (bikeToChangeDocument) {


            bikeToChangeDocument.name = bike.name;
            bikeToChangeDocument.manufacturer = bike.manufacturer;
            bikeToChangeDocument.year = bike.year;
            console.log(chalk.green.inverse('Bike changed!'));

            const changedBikeDocument = await bikeToChangeDocument.save();
            return changedBikeDocument.toObject();

        } else
            console.log(chalk.red.inverse('Bike to change not found!'))

        return null;
    }

    async getBikeById(user, id) {
      
        const foundBike = await this.BikeModel.findOne({ _id: id, belongsTo: user.id });

        if (foundBike) {
            console.log(chalk.green.inverse('Got bike: ' + foundBike.name + ':' + foundBike.manufacturer));
          
            return foundBike.toObject();
        } else {
            console.log(chalk.red.inverse(`Bike not found with id =${id} !`))
        }

        return null;
    }

}

export default MongooseBikeManager;
