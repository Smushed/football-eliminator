export default {
  appendHTML: (email, userId) => {
    email += `<div style='text-align: center;
                                margin-top: 20px;'>
                        Don't want these emails? <a href='http://www.eliminator.football/email/unsubscribe/${userId}'>Unsubscribe here</a> 
                    </div>`;
    return email;
  },
  appendText: (email, userId) => {
    email += `
        
        Don't want these emails? Unsubscribe here: http://www.eliminator.football/email/unsubscribe/${userId}`;
    return email;
  },
};
