module.exports = {
  appendHTML: async (email, userId) => {
    email += `<div style='text-align: center;
                                background-color: lightgrey;'>
                        Don't want these emails? <a href='http://www.eliminator.football/emailPref/${userId}'>Unsubscribe here</a> 
                    </div>`;
    return email;
  },
  appendText: async (email, userId) => {
    email += `
        
        Don't want these emails? Unsubscribe here: http://www.eliminator.football/emailPref/${userId}`;
    return email;
  },
};
