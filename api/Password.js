var twilioSid = process.env["TWILIO_ACCOUNT_SID"];
var twilioAuthToken = process.env["TWILIO_AUTH_TOKEN"];
var twilioNumber = process.env["TWILIO_NUMBER"];
var database = require('../utils/database');
var twilio = require('twilio');
var client = new twilio(twilioSid, twilioAuthToken);

module.exports = {
    
    // use for forgot password. it will send the password to mobile number given the username
    "get": function (req, res, next) {
        
        // username to get the password
        var username = req.query.username;
        
        var query = {
            sql:"select usr.pass, intv.mobile from UserData usr " +
                "inner join InviteData intv on usr.inviteId = intv.id " +
                "where usr.username = @username",
            parameters: [
                {name: "username", value: username}
            ]   
        };
        
        database.execute(query)
            .then( function(results)
            {
                if (results.length >= 1)
                {
                    var password = results[0].pass;
                    var mobile = results[0].mobile;
                    
                    client.messages.create(
                        {
                            body: "Your password is " + password + ".",
                            from: twilioNumber,
                            to: mobile
                        }
                    )
                    .then( messages => 
                    {
                        res.json({success: true, message: "Your password was sent to " + mobile + ". TIP: You can change your password once you login."});
                    })
                    .catch(next);
                }
                else
                {
                    res.json({success: false, message: "User name is not existed."});
                }
            })
            .catch(next);
    }
};
