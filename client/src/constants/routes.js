export const home = '/';
export const signup = '/signup';
export const signin = '/signin';
export const userProfile = '/profile/user/:name';
export const groupProfile = '/profile/group/:name';
export const passwordChange = '/passwordChange';
export const roster = '/roster/:groupname/:username';
export const adminPanel = '/adminPanel/';
export const usedPlayers = '/usedPlayers/:groupname/:username';
export const seasonLongScore = '/seasonLongScore/:userId';
export const updateWeek = '/updateWeek';
export const groupPage = '/group';
export const fourOFour = '/*';
export const createGroup = '/group/create';

//These are hidden routes. Ones that have no link but anyone can go to them if they'd like
export const upgradeToAdmin = '/upgradeToAdmin/';
export const emailPref = '/emailPref/:userId';
