import axios from 'axios';
import { showAlert } from './alerts';

/* global Stripe */

const stripe = Stripe('pk_test_51TRYsC9idrVHJHhHDfhCb594vZahzKt7a4Gv2Cqsr42YJAUkJ9w34cR6yBwyNXFbSnkELI260hWxwVNKi7m6jKcv00xu3lKI7Z');

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from YOUR deployed API using relative URL
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Redirect to Stripe Checkout
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);

    if (err.response && err.response.data && err.response.data.message) {
      showAlert('error', err.response.data.message);
    } else {
      showAlert('error', 'Something went wrong while booking the tour.');
    }
  }
};
