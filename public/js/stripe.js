import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
    try{
        // creating stripe
        const stripe = Stripe('pk_test_51TRYsC9idrVHJHhHDfhCb594vZahzKt7a4Gv2Cqsr42YJAUkJ9w34cR6yBwyNXFbSnkELI260hWxwVNKi7m6jKcv00xu3lKI7Z');
        
        // 1) Get the checkout session from API
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);

        // 2) Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    }

    catch(err){
        showAlert('error' , err);
    }
};


