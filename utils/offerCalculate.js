

const offerCalculate = (allProducts,variant) => {

    let products = allProducts;
    products = products.filter(
        (product) =>
          product.category !== null && product.category.is_deleted !== true
      );
      
      products.forEach((product) => {
          let selectedOffer = null;
        if (
          (product?.offer && product.offer.expiresAt > new Date()) ||
          (product?.category?.offer &&
            product.category.offer.expiresAt > new Date())
        ) {
          
          if (product.offer && product.category?.offer) {
            selectedOffer =
              product.offer.expiresAt > product.category.offer.expiresAt
                ? product.offer
                : product.category.offer;
                console.log(product);
          }else{
            selectedOffer = product.offer ? product.offer : product.category.offer;
          }
          product.offer = selectedOffer;
         if(!variant){
            product.variants.forEach((variant) => {
            
                variant.price = Math.round(
                  variant.price - (variant.price * product.offer.percentage) / 100
                );
              });
         }else{
           
            variant.actualPrice = variant.price
            variant.price = Math.round(
              variant.price - (variant.price * product.offer.percentage) / 100
            );
         }
        } else {
          product.offer = null;
        }
      });
        if(!variant){
            return products;
        }
        return {
            products,
            variant
        }

}

export default offerCalculate;