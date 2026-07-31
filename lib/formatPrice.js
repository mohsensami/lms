// export const formatPrice = (price) => {
//   return Intl.NumberFormat("en-us", {
//     style: "currency",
//     currency: "USD",
//   }).format(price);
// };

export const formatPrice = (price) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
};

/**
 * The real price to charge/display for a course: the discount price if one
 * is set and it's actually lower than the base price, otherwise the base
 * price. Centralized here so the payment flow (Zarinpal request +
 * verification) and every UI price display always agree on the same
 * number — a mismatch between what's shown and what's charged would break
 * Zarinpal's payment verification (it requires the exact original amount).
 */
export const getEffectivePrice = (course) => {
    const price = Number(course?.price) || 0;
    const discountPrice = course?.discountPrice != null ? Number(course.discountPrice) : null;

    if (discountPrice != null && discountPrice > 0 && discountPrice < price) {
        return discountPrice;
    }
    return price;
};

export const hasActiveDiscount = (course) => {
    const price = Number(course?.price) || 0;
    const discountPrice = course?.discountPrice != null ? Number(course.discountPrice) : null;
    return discountPrice != null && discountPrice > 0 && discountPrice < price;
};
