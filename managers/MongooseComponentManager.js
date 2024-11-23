import chalk from 'chalk';
import Component from '../models/ComponentModel.js';

class MongooseComponentManager {
    constructor() {
       
        this.ComponentModel = Component;
    }

    async initialize(app = null) {
        
        return true;
    }

    async fetchComponents(bike) {
        try {
           
            const allComponentsBelongingToBike = await this.ComponentModel.find({ belongsTo: bike.id });
           
            const allComponentObjects = allComponentsBelongingToBike.map(element => {
                return element.toObject()
            })
            console.log(chalk.blueBright.inverse('All components loaded'));
            return allComponentObjects
        } catch (e) {
            console.log(chalk.blueBright.inverse('Empty components loaded'));
            return []
        }
    }

    async addComponent(bike, name, manufacturer, price, quality) {
        
        if (bike) {
           
            const newComponent = {
                name, 
                manufacturer,  
                price,
                quality,
                belongsTo: bike.id
            };

            const addedComponentDocument = await this.ComponentModel.create(newComponent);

            if (addedComponentDocument) {
                console.log(chalk.green.inverse('New component added!'));
              
                const savedComponent = addedComponentDocument.toObject();
                return savedComponent;
            } else
                console.log(chalk.red.inverse('Error in db creating the new component!'))

        } else
            console.log(chalk.red.inverse('No bike is given!'))

        
        return null;

    }

    async removeComponent(id) {
        const selectedComponentById = await this.ComponentModel.findById(id);

        if (selectedComponentById) {
        
            if (selectedComponentById) {
                const removedComponentDocument = await this.ComponentModel.findByIdAndDelete(id);
                console.log(chalk.green.inverse('Component removed!' + removedComponentDocument));
                return removedComponentDocument.toObject();
            } else {
                console.log(chalk.red.inverse(`Component id and user do not correlate! No deletion made!`))
                return null;
            }
        } else {
            console.log(chalk.red.inverse(`No component found with id = ${id} !`))
            return null;
        }
    }

    async changeComponent(component) {
        

        const componentToChangeDocument = await this.ComponentModel.findOne({ _id: component.id });

        if (componentToChangeDocument) {

          
            componentToChangeDocument.name = component.name;
            componentToChangeDocument.manufacturer = component.manufacturer;
            componentToChangeDocument.price = component.price;
            componentToChangeDocument.quality = component.quality;

            console.log(chalk.green.inverse('Component changed!'));

            const changedComponentDocument = await componentToChangeDocument.save();
           
            return changedComponentDocument.toObject();

        } else
            console.log(chalk.red.inverse('Component to change not found!'))

      
        return null;
    }


    async getComponentById(id) {
       
        const foundComponent = await this.ComponentModel.findOne({ _id: id });

        if (foundComponent) {
            console.log(chalk.green.inverse('Got component: ' + foundComponent.name + ':' + foundComponent.manufacturer));
           
            return foundComponent.toObject();
        } else {
            console.log(chalk.red.inverse(`Component not found with id =${id} !`))
        }

        return null;
    }

}

export default MongooseComponentManager;
