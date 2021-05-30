export const home = '/';
export const signup = '/signup';
export const signin = '/signin';
export const profile = '/profile/:type/:name';
export const passwordChange = '/passwordChange';
export const roster = '/roster/:groupname/:username';
export const adminPanel = '/adminPanel/';
export const usedPlayers = '/usedPlayers/:groupname/:username';
export const seasonLongScore = '/seasonLongScore/:userId';
export const updateWeek = '/updateWeek';
export const createGroup = '/createGroup';
export const singleGroup = '/group/:groupname';
export const groupPage = '/groups';
export const fourOFour = '/*';


//These are hidden routes. Ones that have no link but anyone can go to them if they'd like
export const upgradeToAdmin = '/upgradeToAdmin/';