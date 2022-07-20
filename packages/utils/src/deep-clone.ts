import rfdc from 'rfdc';

export const deepClone = rfdc({ proto: false, circles: false });
