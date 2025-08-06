const SACRAMENT_PRICE = {
    wedding: 10000,
    baptism: 2000,
}

export const getSacramentPrice = (sacramentType) => {
    let type = sacramentType;
    console.log("Sacrament Type:", type);
    if (type === 'Wedding') {
        type = 'wedding';
    } else if (type === 'Baptism') {
        type = 'baptism';
    } else if (type === 'Confession') {
        type = 'confession';
    } else if (type === 'Anointing of the Sick') {
        type = 'anointing';
    } else if (type === 'First Communion') {
        type = 'communion';
    } else if (type === 'Burial') {
        type = 'burial';
    }
    const price = SACRAMENT_PRICE[type.toLowerCase()];
    if (price !== undefined) {
        return price;
    } else {
        console.warn(`No price found for sacrament type: ${type}`);
        return 0;
    }
}
