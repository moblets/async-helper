
# async-helper

This helper gets an array of _[async](https://www.npmjs.com/package/async)_ responses and create a final, single response to _[express](https://www.npmjs.com/package/express)_.

Each function in _async_ should set the err variable to true if an error occoured so async-helper will use it's response to create the HTML code and create the object that will be used by Express to send the response.

The default HTML code, if no error occoured is succes (200).
## Install

In your project root folder, run

```
$ npm install --save async-helper
```

## Usage

You should call async-helper after the execution of your async functions, for instance:

```javascript
var asyncHelper = require('async-helper');
/*
 * START SERIAL FUNCTIONS
 */
async.series([
  // Validate arguments
  function(callback) {
    args.validate(
      mobletId, gitUrl, mobletName, mobletVersion,
      gitCheckout, callback);
  },
  // GIT Clone
  function(callback) {
    git.clone(
      mobletId, gitUrl, gitCheckout,
      mobletVersion, callback);
  },
  /*
   * START PARALLELL FUNCTIONS
   */
  function(callback) {
    async.parallel([
      // Test Moblet with Jasmine
      function(callback) {
        moblet.runTests(mobletId, callback);
      },
      // Get Moblet definition
      function(callback) {
        moblet.getDefinitions(mobletId, callback);
      }
    ],
      // Parallel callback function
      callback
    )
  }
],
  function(err, response) {
    /***************************************************************************
    * ASYNC-HELPER CALL
    ***************************************************************************/
    var expressResponse = asyncHelper(err, response);
    /**************************************************************************/
    res.status(expressResponse.code)
      .send(expressResponse);
  });
};
```
## Expected arguments

Async-helper expects a **boolean** (err) and an **array** (response).

As this function is called after the execution of _async_, the boolean (err) should be set after all functions and be set to false if any of the functions had an error.

The array (response) is the array generated by the async execution.

In the functions executed by async, if some error occour, you should set a "code" in the response object sent to the callback.

Example:

```javascript
module.exports = {
  validate: function(gitCheckout, callback) {
    var response = {};
    var paramsMissing = [];
    var err = false;

    if (!gitCheckout) {
      err = true;
      paramsMissing.push('missing GIT checkout hash');
    }

    if (err === true) {
      /*************************************************************************
      * SET THE HTML ERROR CODE IN THE 'code' element
      *************************************************************************/
      response.code = 400;
      /*************************************************************************
      * SET OPTIONAL RESPONSES
      *************************************************************************/
      response.errors = paramsMissing;
    }
    callback(err, response);
  }
};
```
After all the functions executions, you should get an array like this one:

```javascript
[ // This array was generated in sequential functions
	{
		code: 400,
		errors: ['missing GIT checkout hash']
	},
  {},
  {},
	[ // This array was generate in parallell as the last sequential function
		{},
		{
		'en-US': {
			mobletLabel: 'Fidelity Card',
			mobletHint: 'Create a fidelity card to your customers'
		},
		'pt-BR': {
			mobletLabel: 'Cartão de Fidelidade',
			mobletHint: 'Crie um cartão de fidelidade para seus clientes'
		},
		{}
	]
]
```

## Function return

If some error occoured, you should get an object like this:
```javascript
{
	code: 405,
	error: 'Moblet already exists. Perform PUT to update'
}
```

In a success, something like this:

```javascript
{
	code: 200,
	errors: [],
	'en-US': {
		mobletLabel: 'Fidelity Card',
		mobletHint: 'Create a fidelity card to your customers'
	},
	'pt-BR': {
		mobletLabel: 'Cartão de Fidelidade',
		mobletHint: 'Crie um cartão de fidelidade para seus clientes'
	}
}
```
