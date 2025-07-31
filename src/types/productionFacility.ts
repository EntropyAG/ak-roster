export class ProductionFacility {
  	type: string; // FAC, TP, PP
	level: number; // 0 to 3 (0 unbuilt)
	product: string|undefined; // "gold", "exp", "orundum" for FAC, stays undefined for others

	constructor(type: string, level: number, product: string|undefined){
		this.type = type;
		this.level = level;
		this.product = product;
	}
};