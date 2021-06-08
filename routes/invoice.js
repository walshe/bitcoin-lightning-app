var express = require('express');
var router = express.Router();
const BTCPAY_PRIV_KEY = process.env.BTCPAY_PRIV_KEY;
const BTCPAY_MERCHANT_KEY = process.env.BTCPAY_MERCHANT_KEY;

// Initialize the client
const btcpay = require('btcpay')
const keypair = btcpay.crypto.load_keypair(new Buffer.from(BTCPAY_PRIV_KEY, 'hex'));
const client = new btcpay.BTCPayClient('https://lightning.filipmartinsson.com', keypair, {merchant: BTCPAY_MERCHANT_KEY})


/* get & verify invoice. */
router.get('/:id', async function(req, res, next) {
    var invoiceId = req.params.id;
    client.get_invoice(invoiceId)
    .then(invoice => {
        if(invoice.status == "complete" || invoice.status == "paid"){
            //deliver the product/service
            res.render("success");
        }else{
            res.render("failure");
        }
    }).catch(err => console.error(err));
});

/* Create invoice. */
router.post('/', function(req, res, next) {
    
    const product = JSON.parse(req.body.product)
    

    //create invoice and display to user
    client.create_invoice({
        price: product.price, 
        itemDesc: product.name,
        buyer:{
            name: req.body.name,
            addresss:req.body.address1,
            address2:req.body.address2,
            locality:req.body.locality,
            region:req.body.region,
            postalCode:req.body.postalCode,
            country:req.body.country,
            email:req.body.email,
            notify: true,

        },
        currency : "USD", 
        //notificationURL: "https://..../invoice/webhook"
    })
    .then(invoice => {
        res.render("invoice", {invoiceId : invoice.id})
    })
    .catch(err => console.error(err))
});

router.post('/webhook', function(req, res, next) {
    
});


module.exports = router;
