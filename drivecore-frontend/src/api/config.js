const ALB_URL = "http://drivecore-alb-2117620556.eu-north-1.elb.amazonaws.com"; 

export const API_URLS = {
  auth: `${ALB_URL}/api/auth`,
  booking: `${ALB_URL}/api/bookings`,
  inventory: `${ALB_URL}/api/inventory`,
  billing: `${ALB_URL}/api/billing`,
};