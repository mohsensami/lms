// export const formatPrice = (price) => {
//   return Intl.NumberFormat("en-us", {
//     style: "currency",
//     currency: "USD",
//   }).format(price);
// };

export const formatPrice = (price) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
};
