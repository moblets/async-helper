var _ = require('lodash');
/**
 * Callback response. It will read reach sequence of async function responses
 * and create a final, single response with error or success.
 * Escha function should set the err variable to true if a error occoured so
 * this function will use it's response to create the HTML code and set the
 * object that will be used by Express to send the response
 * You should get this function response with Express and verify for error:
 *
 * response = asyncHelper.callback(err, response);
 * res.status(response.code).send(response);
 *
 * @param  {boolean} err      Each async must set this argument to true
 * if an error occoured
 * @param  {array} response Array with objects and arrays for each function
 * executed using async
 * Array example:
 * 	[ // This array was generated in sequential functions
 * 		{
 * 			code: 400,
 * 			errors: []
 * 		},
 * 		[ // This array was generate in parallell as the last sequential function
 * 			{},
 * 			{
 * 			'en-US': {
 * 				mobletLabel: 'Fidelity Card',
 * 				mobletHint: 'Create a fidelity card to your customers'
 * 			},
 * 			'pt-BR': {
 * 				mobletLabel: 'Cartão de Fidelidade',
 * 				mobletHint: 'Crie um cartão de fidelidade para seus clientes'
 * 			},
 * 			{}
 * 		]
 * 	]
 * @return {object}          If any error occoured during the async execution,
 * the response will have an HTML error code and an error. If no error occoured,
 * the response will have a 200 (success) code and the messages given by each
 * function
 *
 * Error example:
 * 	{
 * 		code: 405,
 * 		error: 'Moblet already exists. Perform PUT to update'
 *  }
 * Success example:
 * 	{
 * 		code: 200,
 * 		errors: [],
 * 		'en-US': {
 * 			mobletLabel: 'Fidelity Card',
 * 			mobletHint: 'Create a fidelity card to your customers'
 * 		},
 * 		'pt-BR': {
 * 			mobletLabel: 'Cartão de Fidelidade',
 * 			mobletHint: 'Crie um cartão de fidelidade para seus clientes'
 * 		}
 *  }
 */
exports.callback = function(err, response) {
  console.log(response);
  var finalResponse = {};
  finalResponse.code = 200;

  for (var i in response) {
    // Iterate the parallel responses
    if (!_.isEmpty(response[i])) {
      if (_.isArray(response[i])) {
        response[i] = this.callback(err, response[i]);
      }
      if (err && response[i].code) {
        finalResponse = response[i];
        finalResponse.code = response[i].code;
      } else {
        finalResponse = Object.assign(finalResponse, response[i]);
      }
    }
  }
  return finalResponse;
};
