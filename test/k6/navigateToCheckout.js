import { sleep, group } from "k6";
import http from "k6/http";
import { checkStatus } from "./utils.js";
import { randomIntBetween, findBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

export function navigateToCheckout() {
  group("Navigate to Checkout", function () {
    const response = http.get(`https://${__ENV.HOSTNAME}/checkout/`, {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate",
        "accept-language": "en-US,en;q=0.9",
        connection: "keep-alive",
        host: `${__ENV.HOSTNAME}`,
        "upgrade-insecure-requests": "1",
      },
    });

    checkStatus({
      response: response,
      expectedStatus: 200,
      failOnError: true,
      printOnError: true
    });

    // dynamic value: update_order_review_nonce
    vars["securityToken"] = findBetween(response.body, 'update_order_review_nonce":"', '"');

    // dynamic value: woocommerce-process-checkout-nonce
    vars["checkoutToken"] = response
      .html("#woocommerce-process-checkout-nonce")
      .val();

    console.debug("Security token: " + vars["securityToken"]);
    console.debug("Checkout token: " + vars["checkoutToken"]);
  });

  sleep(randomIntBetween(pauseMin, pauseMax));
}