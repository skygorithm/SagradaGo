const getDisplaySacrament = (sacrament) => {
    if (sacrament === 'wedding') {
        return 'Wedding';
    } else if (sacrament === 'baptism') {
        return 'Baptism';
    } else if (sacrament === 'confession') {
        return 'Confession';
    } else if (sacrament === 'anointing') {
        return 'Anointing of the Sick';
    } else if (sacrament === 'communion') {
        return 'First Communion';
    } else if (sacrament === 'burial') {
        return 'Burial';
    }
    return '';
}

export default getDisplaySacrament;