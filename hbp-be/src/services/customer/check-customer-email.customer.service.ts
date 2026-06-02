import prisma from "../../config/prisma";

export const checkCustomerEmailService = async (email: string) => {
  const customer = await prisma.customer.findUnique({
    where: { email },
    include: {
      billingAddresses: {
        where: {
          isPrimary: true,
        },
        include: {
          city: true,
          country: true,
          phoneCountry: true,
        },
      },
    },
  });
  const billingAddress = customer?.billingAddresses[0] || null;

  let mappedBillingAddress = null;
  if (billingAddress) {
    mappedBillingAddress = {
      firstName: billingAddress.firstName,
      lastName: billingAddress.lastName,
      addressLine1: billingAddress.addressLine1,
      addressLine2: billingAddress.addressLine2,
      cityUuid: billingAddress?.city?.uuid,
      countryUuid: billingAddress?.country?.uuid,
      postalCode: billingAddress.postalCode,
      phoneCountryCodeUuid: billingAddress?.phoneCountry?.uuid,
      phoneNumber: billingAddress.phoneNumber,
    };
  }

  return {
    isVerified: customer ? customer.emailVerified : false,
    billingAddress: mappedBillingAddress,
  };
};
