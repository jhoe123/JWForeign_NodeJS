const database = require('../utils/database');
var ERROR_ACCOUNT_MISMATCHED = 103;
var ERROR_USERNAME_NOT_EXISTS = 104;

module.exports = {
    "post": function (req, res, next) {
        var username = req.query.username;
        var pass = req.query.pass;
        
        var query = {
            sql: 'select contact.*, usr.pass from UserData usr ' +
            'inner join ContactData contact on usr.username = contact.username ' +
            'where usr.username = \'' + username + '\''
        };

        database.execute(query)
            .then(
                function(results)
                {
                    // is successfull logging in
                    if (results.length >= 1)
                    {
                        if (results[0].pass == pass)
                            res.json( {"success": true, 'data': results[0] } );
                        else
                            res.json( {"success": false, "code": ERROR_ACCOUNT_MISMATCHED});
                    }
                    else
                    {
                        res.json( {'success': false, "code": ERROR_USERNAME_NOT_EXISTS});
                    }
                },
                (err) => {
                    console.log(err);
                })
            
    }
};
