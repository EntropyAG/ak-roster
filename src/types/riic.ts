import { ProductionFacility } from "./productionFacility";

export class Riic {
  	controlCenter: number;
	production: ProductionFacility[];
	dorms: number[];
	receptionRoom: number;
	workshop: number;
	office: number;
	trainingRoom: number;

	constructor(
		controlCenter: number,
		production: ProductionFacility[],
		dorms: number[],
		receptionRoom: number,
		workshop: number,
		office: number,
		trainingRoom: number
	){
		this.controlCenter = controlCenter;
		this.production = production;
		this.dorms = dorms;
		this.receptionRoom = receptionRoom;
		this.workshop = workshop;
		this.office = office;
		this.trainingRoom = trainingRoom;
	}

	getHighestDormLevel(){
		let currentHighest = 0;
		for(let dorm of this.dorms){
			if(dorm > currentHighest){
				currentHighest = dorm;
			}
		}
		return currentHighest;
	}
	
	getSumOfDormLevels(){
		let sum = 0;
		for(let dorm of this.dorms){
			sum += dorm;
		}
		return sum;
	}
	
	getSumOfFacilityLevels(){
		let sum = this.controlCenter
			+ this.receptionRoom
			+ this.workshop
			+ this.trainingRoom
			+ this.office
			+ this.getSumOfDormLevels()
		;
	
		for(let facility of this.production){
			sum += facility.level;
		}
	
		return sum;
	}
	
	getPowerPlantCount(){
		let count = 0;
		for(let facility of this.production){
			if(facility.type === "PP"){
				count++;
			}
		}
		return count;
	}
	
	getTradingPostCount(){
		let count = 0;
		for(let facility of this.production){
			if(facility.type === "TP"){
				count++;
			}
		}
		return count;
	}

	getGoldLineCount(){
		let count = 0;
		for(let facility of this.production){
			if(facility.type === "FAC" && facility.product === "gold"){
				count++;
			}
		}
		return count;
	}

	// If at least a FAC produces gold, that's 1 recipe, if another crafts EXP tickets, that's another
	getDifferentRecipesCount(){
		let recipes: (string | undefined)[] = [];
		for(let facility of this.production){
			if(facility.type === "FAC" && !recipes.includes(facility.product)){
				recipes.push(facility.product);
			}
		}
		return recipes.length;
	}

	getRecruitmentSlotsCount(){
		if(this.office === 0){
			return 0;
		}
		return this.office + 1;
	}

	// Only counts the recruitment slots added beyond the first 2
	getExtraRecruitSlotsCount(){
		if(this.office === 2){
			return 1;
		}else if(this.office === 3){
			return 2;
		}
		return 0;
	}

	// If all buildings cleared. That's the target, don't bother with more than that.
	getDroneCap(){
		return 225;
	}
};