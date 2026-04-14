
// Files Imports
import * as configure from "@api/configure";
import * as API_000 from "@api/root/src/api/auth/email-confirmation-link.ts";
import * as API_001 from "@api/root/src/api/auth/password-reset-link.ts";
import * as API_002 from "@api/root/src/api/create-checkout-session.ts";
import * as API_003 from "@api/root/src/api/export.ts";
import * as API_004 from "@api/root/src/api/notify-admin.ts";
import * as API_005 from "@api/root/src/api/send-email.ts";
import * as API_006 from "@api/root/src/api/sendAlert.ts";
import * as API_007 from "@api/root/src/api/stripe/create-checkout-session.ts";
import * as API_008 from "@api/root/src/api/stripe/verify-payment.ts";
import * as API_009 from "@api/root/src/api/stripe/webhook.ts";
import * as API_010 from "@api/root/src/api/test.ts";
import * as API_011 from "@api/root/src/api/trial/send-email-otp.ts";
import * as API_012 from "@api/root/src/api/trial/send-sms-otp.ts";
import * as API_013 from "@api/root/src/api/trial/verify-email-otp.ts";
import * as API_014 from "@api/root/src/api/trial/verify-sms-otp.ts";
import * as API_015 from "@api/root/src/api/users/activate-concierge.ts";
import * as API_016 from "@api/root/src/api/users/create-trial-access.ts";
import * as API_017 from "@api/root/src/api/users/disable-concierge.ts";
import * as API_018 from "@api/root/src/api/users/invite-concierge.ts";
import * as API_019 from "@api/root/src/api/users/list-firebase.ts";
import * as API_020 from "@api/root/src/api/users/send-regularization-link.ts";

// Public RESTful API Methods and Paths
// This section describes the available HTTP methods and their corresponding endpoints (paths).
// USE    /api/auth/email-confirmation-link      src/api/auth/email-confirmation-link.ts?fn=default
// USE    /api/auth/email-confirmation-link      src/api/auth/email-confirmation-link.ts?fn=USE
// GET    /api/auth/email-confirmation-link      src/api/auth/email-confirmation-link.ts?fn=GET
// POST   /api/auth/email-confirmation-link      src/api/auth/email-confirmation-link.ts?fn=POST
// PATCH  /api/auth/email-confirmation-link      src/api/auth/email-confirmation-link.ts?fn=PATCH
// PUT    /api/auth/email-confirmation-link      src/api/auth/email-confirmation-link.ts?fn=PUT
// DELETE /api/auth/email-confirmation-link      src/api/auth/email-confirmation-link.ts?fn=DELETE
// USE    /api/auth/password-reset-link          src/api/auth/password-reset-link.ts?fn=default
// USE    /api/auth/password-reset-link          src/api/auth/password-reset-link.ts?fn=USE
// GET    /api/auth/password-reset-link          src/api/auth/password-reset-link.ts?fn=GET
// POST   /api/auth/password-reset-link          src/api/auth/password-reset-link.ts?fn=POST
// PATCH  /api/auth/password-reset-link          src/api/auth/password-reset-link.ts?fn=PATCH
// PUT    /api/auth/password-reset-link          src/api/auth/password-reset-link.ts?fn=PUT
// DELETE /api/auth/password-reset-link          src/api/auth/password-reset-link.ts?fn=DELETE
// USE    /api/create-checkout-session           src/api/create-checkout-session.ts?fn=default
// USE    /api/create-checkout-session           src/api/create-checkout-session.ts?fn=USE
// GET    /api/create-checkout-session           src/api/create-checkout-session.ts?fn=GET
// POST   /api/create-checkout-session           src/api/create-checkout-session.ts?fn=POST
// PATCH  /api/create-checkout-session           src/api/create-checkout-session.ts?fn=PATCH
// PUT    /api/create-checkout-session           src/api/create-checkout-session.ts?fn=PUT
// DELETE /api/create-checkout-session           src/api/create-checkout-session.ts?fn=DELETE
// USE    /api/export                            src/api/export.ts?fn=default
// USE    /api/export                            src/api/export.ts?fn=USE
// GET    /api/export                            src/api/export.ts?fn=GET
// POST   /api/export                            src/api/export.ts?fn=POST
// PATCH  /api/export                            src/api/export.ts?fn=PATCH
// PUT    /api/export                            src/api/export.ts?fn=PUT
// DELETE /api/export                            src/api/export.ts?fn=DELETE
// USE    /api/notify-admin                      src/api/notify-admin.ts?fn=default
// USE    /api/notify-admin                      src/api/notify-admin.ts?fn=USE
// GET    /api/notify-admin                      src/api/notify-admin.ts?fn=GET
// POST   /api/notify-admin                      src/api/notify-admin.ts?fn=POST
// PATCH  /api/notify-admin                      src/api/notify-admin.ts?fn=PATCH
// PUT    /api/notify-admin                      src/api/notify-admin.ts?fn=PUT
// DELETE /api/notify-admin                      src/api/notify-admin.ts?fn=DELETE
// USE    /api/send-email                        src/api/send-email.ts?fn=default
// USE    /api/send-email                        src/api/send-email.ts?fn=USE
// GET    /api/send-email                        src/api/send-email.ts?fn=GET
// POST   /api/send-email                        src/api/send-email.ts?fn=POST
// PATCH  /api/send-email                        src/api/send-email.ts?fn=PATCH
// PUT    /api/send-email                        src/api/send-email.ts?fn=PUT
// DELETE /api/send-email                        src/api/send-email.ts?fn=DELETE
// USE    /api/sendAlert                         src/api/sendAlert.ts?fn=default
// USE    /api/sendAlert                         src/api/sendAlert.ts?fn=USE
// GET    /api/sendAlert                         src/api/sendAlert.ts?fn=GET
// POST   /api/sendAlert                         src/api/sendAlert.ts?fn=POST
// PATCH  /api/sendAlert                         src/api/sendAlert.ts?fn=PATCH
// PUT    /api/sendAlert                         src/api/sendAlert.ts?fn=PUT
// DELETE /api/sendAlert                         src/api/sendAlert.ts?fn=DELETE
// USE    /api/stripe/create-checkout-session    src/api/stripe/create-checkout-session.ts?fn=default
// USE    /api/stripe/create-checkout-session    src/api/stripe/create-checkout-session.ts?fn=USE
// GET    /api/stripe/create-checkout-session    src/api/stripe/create-checkout-session.ts?fn=GET
// POST   /api/stripe/create-checkout-session    src/api/stripe/create-checkout-session.ts?fn=POST
// PATCH  /api/stripe/create-checkout-session    src/api/stripe/create-checkout-session.ts?fn=PATCH
// PUT    /api/stripe/create-checkout-session    src/api/stripe/create-checkout-session.ts?fn=PUT
// DELETE /api/stripe/create-checkout-session    src/api/stripe/create-checkout-session.ts?fn=DELETE
// USE    /api/stripe/verify-payment             src/api/stripe/verify-payment.ts?fn=default
// USE    /api/stripe/verify-payment             src/api/stripe/verify-payment.ts?fn=USE
// GET    /api/stripe/verify-payment             src/api/stripe/verify-payment.ts?fn=GET
// POST   /api/stripe/verify-payment             src/api/stripe/verify-payment.ts?fn=POST
// PATCH  /api/stripe/verify-payment             src/api/stripe/verify-payment.ts?fn=PATCH
// PUT    /api/stripe/verify-payment             src/api/stripe/verify-payment.ts?fn=PUT
// DELETE /api/stripe/verify-payment             src/api/stripe/verify-payment.ts?fn=DELETE
// USE    /api/stripe/webhook                    src/api/stripe/webhook.ts?fn=default
// USE    /api/stripe/webhook                    src/api/stripe/webhook.ts?fn=USE
// GET    /api/stripe/webhook                    src/api/stripe/webhook.ts?fn=GET
// POST   /api/stripe/webhook                    src/api/stripe/webhook.ts?fn=POST
// PATCH  /api/stripe/webhook                    src/api/stripe/webhook.ts?fn=PATCH
// PUT    /api/stripe/webhook                    src/api/stripe/webhook.ts?fn=PUT
// DELETE /api/stripe/webhook                    src/api/stripe/webhook.ts?fn=DELETE
// USE    /api/test                              src/api/test.ts?fn=default
// USE    /api/test                              src/api/test.ts?fn=USE
// GET    /api/test                              src/api/test.ts?fn=GET
// POST   /api/test                              src/api/test.ts?fn=POST
// PATCH  /api/test                              src/api/test.ts?fn=PATCH
// PUT    /api/test                              src/api/test.ts?fn=PUT
// DELETE /api/test                              src/api/test.ts?fn=DELETE
// USE    /api/trial/send-email-otp              src/api/trial/send-email-otp.ts?fn=default
// USE    /api/trial/send-email-otp              src/api/trial/send-email-otp.ts?fn=USE
// GET    /api/trial/send-email-otp              src/api/trial/send-email-otp.ts?fn=GET
// POST   /api/trial/send-email-otp              src/api/trial/send-email-otp.ts?fn=POST
// PATCH  /api/trial/send-email-otp              src/api/trial/send-email-otp.ts?fn=PATCH
// PUT    /api/trial/send-email-otp              src/api/trial/send-email-otp.ts?fn=PUT
// DELETE /api/trial/send-email-otp              src/api/trial/send-email-otp.ts?fn=DELETE
// USE    /api/trial/send-sms-otp                src/api/trial/send-sms-otp.ts?fn=default
// USE    /api/trial/send-sms-otp                src/api/trial/send-sms-otp.ts?fn=USE
// GET    /api/trial/send-sms-otp                src/api/trial/send-sms-otp.ts?fn=GET
// POST   /api/trial/send-sms-otp                src/api/trial/send-sms-otp.ts?fn=POST
// PATCH  /api/trial/send-sms-otp                src/api/trial/send-sms-otp.ts?fn=PATCH
// PUT    /api/trial/send-sms-otp                src/api/trial/send-sms-otp.ts?fn=PUT
// DELETE /api/trial/send-sms-otp                src/api/trial/send-sms-otp.ts?fn=DELETE
// USE    /api/trial/verify-email-otp            src/api/trial/verify-email-otp.ts?fn=default
// USE    /api/trial/verify-email-otp            src/api/trial/verify-email-otp.ts?fn=USE
// GET    /api/trial/verify-email-otp            src/api/trial/verify-email-otp.ts?fn=GET
// POST   /api/trial/verify-email-otp            src/api/trial/verify-email-otp.ts?fn=POST
// PATCH  /api/trial/verify-email-otp            src/api/trial/verify-email-otp.ts?fn=PATCH
// PUT    /api/trial/verify-email-otp            src/api/trial/verify-email-otp.ts?fn=PUT
// DELETE /api/trial/verify-email-otp            src/api/trial/verify-email-otp.ts?fn=DELETE
// USE    /api/trial/verify-sms-otp              src/api/trial/verify-sms-otp.ts?fn=default
// USE    /api/trial/verify-sms-otp              src/api/trial/verify-sms-otp.ts?fn=USE
// GET    /api/trial/verify-sms-otp              src/api/trial/verify-sms-otp.ts?fn=GET
// POST   /api/trial/verify-sms-otp              src/api/trial/verify-sms-otp.ts?fn=POST
// PATCH  /api/trial/verify-sms-otp              src/api/trial/verify-sms-otp.ts?fn=PATCH
// PUT    /api/trial/verify-sms-otp              src/api/trial/verify-sms-otp.ts?fn=PUT
// DELETE /api/trial/verify-sms-otp              src/api/trial/verify-sms-otp.ts?fn=DELETE
// USE    /api/users/activate-concierge          src/api/users/activate-concierge.ts?fn=default
// USE    /api/users/activate-concierge          src/api/users/activate-concierge.ts?fn=USE
// GET    /api/users/activate-concierge          src/api/users/activate-concierge.ts?fn=GET
// POST   /api/users/activate-concierge          src/api/users/activate-concierge.ts?fn=POST
// PATCH  /api/users/activate-concierge          src/api/users/activate-concierge.ts?fn=PATCH
// PUT    /api/users/activate-concierge          src/api/users/activate-concierge.ts?fn=PUT
// DELETE /api/users/activate-concierge          src/api/users/activate-concierge.ts?fn=DELETE
// USE    /api/users/create-trial-access         src/api/users/create-trial-access.ts?fn=default
// USE    /api/users/create-trial-access         src/api/users/create-trial-access.ts?fn=USE
// GET    /api/users/create-trial-access         src/api/users/create-trial-access.ts?fn=GET
// POST   /api/users/create-trial-access         src/api/users/create-trial-access.ts?fn=POST
// PATCH  /api/users/create-trial-access         src/api/users/create-trial-access.ts?fn=PATCH
// PUT    /api/users/create-trial-access         src/api/users/create-trial-access.ts?fn=PUT
// DELETE /api/users/create-trial-access         src/api/users/create-trial-access.ts?fn=DELETE
// USE    /api/users/disable-concierge           src/api/users/disable-concierge.ts?fn=default
// USE    /api/users/disable-concierge           src/api/users/disable-concierge.ts?fn=USE
// GET    /api/users/disable-concierge           src/api/users/disable-concierge.ts?fn=GET
// POST   /api/users/disable-concierge           src/api/users/disable-concierge.ts?fn=POST
// PATCH  /api/users/disable-concierge           src/api/users/disable-concierge.ts?fn=PATCH
// PUT    /api/users/disable-concierge           src/api/users/disable-concierge.ts?fn=PUT
// DELETE /api/users/disable-concierge           src/api/users/disable-concierge.ts?fn=DELETE
// USE    /api/users/invite-concierge            src/api/users/invite-concierge.ts?fn=default
// USE    /api/users/invite-concierge            src/api/users/invite-concierge.ts?fn=USE
// GET    /api/users/invite-concierge            src/api/users/invite-concierge.ts?fn=GET
// POST   /api/users/invite-concierge            src/api/users/invite-concierge.ts?fn=POST
// PATCH  /api/users/invite-concierge            src/api/users/invite-concierge.ts?fn=PATCH
// PUT    /api/users/invite-concierge            src/api/users/invite-concierge.ts?fn=PUT
// DELETE /api/users/invite-concierge            src/api/users/invite-concierge.ts?fn=DELETE
// USE    /api/users/list-firebase               src/api/users/list-firebase.ts?fn=default
// USE    /api/users/list-firebase               src/api/users/list-firebase.ts?fn=USE
// GET    /api/users/list-firebase               src/api/users/list-firebase.ts?fn=GET
// POST   /api/users/list-firebase               src/api/users/list-firebase.ts?fn=POST
// PATCH  /api/users/list-firebase               src/api/users/list-firebase.ts?fn=PATCH
// PUT    /api/users/list-firebase               src/api/users/list-firebase.ts?fn=PUT
// DELETE /api/users/list-firebase               src/api/users/list-firebase.ts?fn=DELETE
// USE    /api/users/send-regularization-link    src/api/users/send-regularization-link.ts?fn=default
// USE    /api/users/send-regularization-link    src/api/users/send-regularization-link.ts?fn=USE
// GET    /api/users/send-regularization-link    src/api/users/send-regularization-link.ts?fn=GET
// POST   /api/users/send-regularization-link    src/api/users/send-regularization-link.ts?fn=POST
// PATCH  /api/users/send-regularization-link    src/api/users/send-regularization-link.ts?fn=PATCH
// PUT    /api/users/send-regularization-link    src/api/users/send-regularization-link.ts?fn=PUT
// DELETE /api/users/send-regularization-link    src/api/users/send-regularization-link.ts?fn=DELETE

const internal  = [
  API_000.default  && { cb: API_000.default , method: "use"    , route: "/auth/email-confirmation-link"   , url: "/api/auth/email-confirmation-link"   , source: "src/api/auth/email-confirmation-link.ts?fn=default"   },
  API_000.USE      && { cb: API_000.USE     , method: "use"    , route: "/auth/email-confirmation-link"   , url: "/api/auth/email-confirmation-link"   , source: "src/api/auth/email-confirmation-link.ts?fn=USE"       },
  API_000.GET      && { cb: API_000.GET     , method: "get"    , route: "/auth/email-confirmation-link"   , url: "/api/auth/email-confirmation-link"   , source: "src/api/auth/email-confirmation-link.ts?fn=GET"       },
  API_000.POST     && { cb: API_000.POST    , method: "post"   , route: "/auth/email-confirmation-link"   , url: "/api/auth/email-confirmation-link"   , source: "src/api/auth/email-confirmation-link.ts?fn=POST"      },
  API_000.PATCH    && { cb: API_000.PATCH   , method: "patch"  , route: "/auth/email-confirmation-link"   , url: "/api/auth/email-confirmation-link"   , source: "src/api/auth/email-confirmation-link.ts?fn=PATCH"     },
  API_000.PUT      && { cb: API_000.PUT     , method: "put"    , route: "/auth/email-confirmation-link"   , url: "/api/auth/email-confirmation-link"   , source: "src/api/auth/email-confirmation-link.ts?fn=PUT"       },
  API_000.DELETE   && { cb: API_000.DELETE  , method: "delete" , route: "/auth/email-confirmation-link"   , url: "/api/auth/email-confirmation-link"   , source: "src/api/auth/email-confirmation-link.ts?fn=DELETE"    },
  API_001.default  && { cb: API_001.default , method: "use"    , route: "/auth/password-reset-link"       , url: "/api/auth/password-reset-link"       , source: "src/api/auth/password-reset-link.ts?fn=default"       },
  API_001.USE      && { cb: API_001.USE     , method: "use"    , route: "/auth/password-reset-link"       , url: "/api/auth/password-reset-link"       , source: "src/api/auth/password-reset-link.ts?fn=USE"           },
  API_001.GET      && { cb: API_001.GET     , method: "get"    , route: "/auth/password-reset-link"       , url: "/api/auth/password-reset-link"       , source: "src/api/auth/password-reset-link.ts?fn=GET"           },
  API_001.POST     && { cb: API_001.POST    , method: "post"   , route: "/auth/password-reset-link"       , url: "/api/auth/password-reset-link"       , source: "src/api/auth/password-reset-link.ts?fn=POST"          },
  API_001.PATCH    && { cb: API_001.PATCH   , method: "patch"  , route: "/auth/password-reset-link"       , url: "/api/auth/password-reset-link"       , source: "src/api/auth/password-reset-link.ts?fn=PATCH"         },
  API_001.PUT      && { cb: API_001.PUT     , method: "put"    , route: "/auth/password-reset-link"       , url: "/api/auth/password-reset-link"       , source: "src/api/auth/password-reset-link.ts?fn=PUT"           },
  API_001.DELETE   && { cb: API_001.DELETE  , method: "delete" , route: "/auth/password-reset-link"       , url: "/api/auth/password-reset-link"       , source: "src/api/auth/password-reset-link.ts?fn=DELETE"        },
  API_002.default  && { cb: API_002.default , method: "use"    , route: "/create-checkout-session"        , url: "/api/create-checkout-session"        , source: "src/api/create-checkout-session.ts?fn=default"        },
  API_002.USE      && { cb: API_002.USE     , method: "use"    , route: "/create-checkout-session"        , url: "/api/create-checkout-session"        , source: "src/api/create-checkout-session.ts?fn=USE"            },
  API_002.GET      && { cb: API_002.GET     , method: "get"    , route: "/create-checkout-session"        , url: "/api/create-checkout-session"        , source: "src/api/create-checkout-session.ts?fn=GET"            },
  API_002.POST     && { cb: API_002.POST    , method: "post"   , route: "/create-checkout-session"        , url: "/api/create-checkout-session"        , source: "src/api/create-checkout-session.ts?fn=POST"           },
  API_002.PATCH    && { cb: API_002.PATCH   , method: "patch"  , route: "/create-checkout-session"        , url: "/api/create-checkout-session"        , source: "src/api/create-checkout-session.ts?fn=PATCH"          },
  API_002.PUT      && { cb: API_002.PUT     , method: "put"    , route: "/create-checkout-session"        , url: "/api/create-checkout-session"        , source: "src/api/create-checkout-session.ts?fn=PUT"            },
  API_002.DELETE   && { cb: API_002.DELETE  , method: "delete" , route: "/create-checkout-session"        , url: "/api/create-checkout-session"        , source: "src/api/create-checkout-session.ts?fn=DELETE"         },
  API_003.default  && { cb: API_003.default , method: "use"    , route: "/export"                         , url: "/api/export"                         , source: "src/api/export.ts?fn=default"                         },
  API_003.USE      && { cb: API_003.USE     , method: "use"    , route: "/export"                         , url: "/api/export"                         , source: "src/api/export.ts?fn=USE"                             },
  API_003.GET      && { cb: API_003.GET     , method: "get"    , route: "/export"                         , url: "/api/export"                         , source: "src/api/export.ts?fn=GET"                             },
  API_003.POST     && { cb: API_003.POST    , method: "post"   , route: "/export"                         , url: "/api/export"                         , source: "src/api/export.ts?fn=POST"                            },
  API_003.PATCH    && { cb: API_003.PATCH   , method: "patch"  , route: "/export"                         , url: "/api/export"                         , source: "src/api/export.ts?fn=PATCH"                           },
  API_003.PUT      && { cb: API_003.PUT     , method: "put"    , route: "/export"                         , url: "/api/export"                         , source: "src/api/export.ts?fn=PUT"                             },
  API_003.DELETE   && { cb: API_003.DELETE  , method: "delete" , route: "/export"                         , url: "/api/export"                         , source: "src/api/export.ts?fn=DELETE"                          },
  API_004.default  && { cb: API_004.default , method: "use"    , route: "/notify-admin"                   , url: "/api/notify-admin"                   , source: "src/api/notify-admin.ts?fn=default"                   },
  API_004.USE      && { cb: API_004.USE     , method: "use"    , route: "/notify-admin"                   , url: "/api/notify-admin"                   , source: "src/api/notify-admin.ts?fn=USE"                       },
  API_004.GET      && { cb: API_004.GET     , method: "get"    , route: "/notify-admin"                   , url: "/api/notify-admin"                   , source: "src/api/notify-admin.ts?fn=GET"                       },
  API_004.POST     && { cb: API_004.POST    , method: "post"   , route: "/notify-admin"                   , url: "/api/notify-admin"                   , source: "src/api/notify-admin.ts?fn=POST"                      },
  API_004.PATCH    && { cb: API_004.PATCH   , method: "patch"  , route: "/notify-admin"                   , url: "/api/notify-admin"                   , source: "src/api/notify-admin.ts?fn=PATCH"                     },
  API_004.PUT      && { cb: API_004.PUT     , method: "put"    , route: "/notify-admin"                   , url: "/api/notify-admin"                   , source: "src/api/notify-admin.ts?fn=PUT"                       },
  API_004.DELETE   && { cb: API_004.DELETE  , method: "delete" , route: "/notify-admin"                   , url: "/api/notify-admin"                   , source: "src/api/notify-admin.ts?fn=DELETE"                    },
  API_005.default  && { cb: API_005.default , method: "use"    , route: "/send-email"                     , url: "/api/send-email"                     , source: "src/api/send-email.ts?fn=default"                     },
  API_005.USE      && { cb: API_005.USE     , method: "use"    , route: "/send-email"                     , url: "/api/send-email"                     , source: "src/api/send-email.ts?fn=USE"                         },
  API_005.GET      && { cb: API_005.GET     , method: "get"    , route: "/send-email"                     , url: "/api/send-email"                     , source: "src/api/send-email.ts?fn=GET"                         },
  API_005.POST     && { cb: API_005.POST    , method: "post"   , route: "/send-email"                     , url: "/api/send-email"                     , source: "src/api/send-email.ts?fn=POST"                        },
  API_005.PATCH    && { cb: API_005.PATCH   , method: "patch"  , route: "/send-email"                     , url: "/api/send-email"                     , source: "src/api/send-email.ts?fn=PATCH"                       },
  API_005.PUT      && { cb: API_005.PUT     , method: "put"    , route: "/send-email"                     , url: "/api/send-email"                     , source: "src/api/send-email.ts?fn=PUT"                         },
  API_005.DELETE   && { cb: API_005.DELETE  , method: "delete" , route: "/send-email"                     , url: "/api/send-email"                     , source: "src/api/send-email.ts?fn=DELETE"                      },
  API_006.default  && { cb: API_006.default , method: "use"    , route: "/sendAlert"                      , url: "/api/sendAlert"                      , source: "src/api/sendAlert.ts?fn=default"                      },
  API_006.USE      && { cb: API_006.USE     , method: "use"    , route: "/sendAlert"                      , url: "/api/sendAlert"                      , source: "src/api/sendAlert.ts?fn=USE"                          },
  API_006.GET      && { cb: API_006.GET     , method: "get"    , route: "/sendAlert"                      , url: "/api/sendAlert"                      , source: "src/api/sendAlert.ts?fn=GET"                          },
  API_006.POST     && { cb: API_006.POST    , method: "post"   , route: "/sendAlert"                      , url: "/api/sendAlert"                      , source: "src/api/sendAlert.ts?fn=POST"                         },
  API_006.PATCH    && { cb: API_006.PATCH   , method: "patch"  , route: "/sendAlert"                      , url: "/api/sendAlert"                      , source: "src/api/sendAlert.ts?fn=PATCH"                        },
  API_006.PUT      && { cb: API_006.PUT     , method: "put"    , route: "/sendAlert"                      , url: "/api/sendAlert"                      , source: "src/api/sendAlert.ts?fn=PUT"                          },
  API_006.DELETE   && { cb: API_006.DELETE  , method: "delete" , route: "/sendAlert"                      , url: "/api/sendAlert"                      , source: "src/api/sendAlert.ts?fn=DELETE"                       },
  API_007.default  && { cb: API_007.default , method: "use"    , route: "/stripe/create-checkout-session" , url: "/api/stripe/create-checkout-session" , source: "src/api/stripe/create-checkout-session.ts?fn=default" },
  API_007.USE      && { cb: API_007.USE     , method: "use"    , route: "/stripe/create-checkout-session" , url: "/api/stripe/create-checkout-session" , source: "src/api/stripe/create-checkout-session.ts?fn=USE"     },
  API_007.GET      && { cb: API_007.GET     , method: "get"    , route: "/stripe/create-checkout-session" , url: "/api/stripe/create-checkout-session" , source: "src/api/stripe/create-checkout-session.ts?fn=GET"     },
  API_007.POST     && { cb: API_007.POST    , method: "post"   , route: "/stripe/create-checkout-session" , url: "/api/stripe/create-checkout-session" , source: "src/api/stripe/create-checkout-session.ts?fn=POST"    },
  API_007.PATCH    && { cb: API_007.PATCH   , method: "patch"  , route: "/stripe/create-checkout-session" , url: "/api/stripe/create-checkout-session" , source: "src/api/stripe/create-checkout-session.ts?fn=PATCH"   },
  API_007.PUT      && { cb: API_007.PUT     , method: "put"    , route: "/stripe/create-checkout-session" , url: "/api/stripe/create-checkout-session" , source: "src/api/stripe/create-checkout-session.ts?fn=PUT"     },
  API_007.DELETE   && { cb: API_007.DELETE  , method: "delete" , route: "/stripe/create-checkout-session" , url: "/api/stripe/create-checkout-session" , source: "src/api/stripe/create-checkout-session.ts?fn=DELETE"  },
  API_008.default  && { cb: API_008.default , method: "use"    , route: "/stripe/verify-payment"          , url: "/api/stripe/verify-payment"          , source: "src/api/stripe/verify-payment.ts?fn=default"          },
  API_008.USE      && { cb: API_008.USE     , method: "use"    , route: "/stripe/verify-payment"          , url: "/api/stripe/verify-payment"          , source: "src/api/stripe/verify-payment.ts?fn=USE"              },
  API_008.GET      && { cb: API_008.GET     , method: "get"    , route: "/stripe/verify-payment"          , url: "/api/stripe/verify-payment"          , source: "src/api/stripe/verify-payment.ts?fn=GET"              },
  API_008.POST     && { cb: API_008.POST    , method: "post"   , route: "/stripe/verify-payment"          , url: "/api/stripe/verify-payment"          , source: "src/api/stripe/verify-payment.ts?fn=POST"             },
  API_008.PATCH    && { cb: API_008.PATCH   , method: "patch"  , route: "/stripe/verify-payment"          , url: "/api/stripe/verify-payment"          , source: "src/api/stripe/verify-payment.ts?fn=PATCH"            },
  API_008.PUT      && { cb: API_008.PUT     , method: "put"    , route: "/stripe/verify-payment"          , url: "/api/stripe/verify-payment"          , source: "src/api/stripe/verify-payment.ts?fn=PUT"              },
  API_008.DELETE   && { cb: API_008.DELETE  , method: "delete" , route: "/stripe/verify-payment"          , url: "/api/stripe/verify-payment"          , source: "src/api/stripe/verify-payment.ts?fn=DELETE"           },
  API_009.default  && { cb: API_009.default , method: "use"    , route: "/stripe/webhook"                 , url: "/api/stripe/webhook"                 , source: "src/api/stripe/webhook.ts?fn=default"                 },
  API_009.USE      && { cb: API_009.USE     , method: "use"    , route: "/stripe/webhook"                 , url: "/api/stripe/webhook"                 , source: "src/api/stripe/webhook.ts?fn=USE"                     },
  API_009.GET      && { cb: API_009.GET     , method: "get"    , route: "/stripe/webhook"                 , url: "/api/stripe/webhook"                 , source: "src/api/stripe/webhook.ts?fn=GET"                     },
  API_009.POST     && { cb: API_009.POST    , method: "post"   , route: "/stripe/webhook"                 , url: "/api/stripe/webhook"                 , source: "src/api/stripe/webhook.ts?fn=POST"                    },
  API_009.PATCH    && { cb: API_009.PATCH   , method: "patch"  , route: "/stripe/webhook"                 , url: "/api/stripe/webhook"                 , source: "src/api/stripe/webhook.ts?fn=PATCH"                   },
  API_009.PUT      && { cb: API_009.PUT     , method: "put"    , route: "/stripe/webhook"                 , url: "/api/stripe/webhook"                 , source: "src/api/stripe/webhook.ts?fn=PUT"                     },
  API_009.DELETE   && { cb: API_009.DELETE  , method: "delete" , route: "/stripe/webhook"                 , url: "/api/stripe/webhook"                 , source: "src/api/stripe/webhook.ts?fn=DELETE"                  },
  API_010.default  && { cb: API_010.default , method: "use"    , route: "/test"                           , url: "/api/test"                           , source: "src/api/test.ts?fn=default"                           },
  API_010.USE      && { cb: API_010.USE     , method: "use"    , route: "/test"                           , url: "/api/test"                           , source: "src/api/test.ts?fn=USE"                               },
  API_010.GET      && { cb: API_010.GET     , method: "get"    , route: "/test"                           , url: "/api/test"                           , source: "src/api/test.ts?fn=GET"                               },
  API_010.POST     && { cb: API_010.POST    , method: "post"   , route: "/test"                           , url: "/api/test"                           , source: "src/api/test.ts?fn=POST"                              },
  API_010.PATCH    && { cb: API_010.PATCH   , method: "patch"  , route: "/test"                           , url: "/api/test"                           , source: "src/api/test.ts?fn=PATCH"                             },
  API_010.PUT      && { cb: API_010.PUT     , method: "put"    , route: "/test"                           , url: "/api/test"                           , source: "src/api/test.ts?fn=PUT"                               },
  API_010.DELETE   && { cb: API_010.DELETE  , method: "delete" , route: "/test"                           , url: "/api/test"                           , source: "src/api/test.ts?fn=DELETE"                            },
  API_011.default  && { cb: API_011.default , method: "use"    , route: "/trial/send-email-otp"           , url: "/api/trial/send-email-otp"           , source: "src/api/trial/send-email-otp.ts?fn=default"           },
  API_011.USE      && { cb: API_011.USE     , method: "use"    , route: "/trial/send-email-otp"           , url: "/api/trial/send-email-otp"           , source: "src/api/trial/send-email-otp.ts?fn=USE"               },
  API_011.GET      && { cb: API_011.GET     , method: "get"    , route: "/trial/send-email-otp"           , url: "/api/trial/send-email-otp"           , source: "src/api/trial/send-email-otp.ts?fn=GET"               },
  API_011.POST     && { cb: API_011.POST    , method: "post"   , route: "/trial/send-email-otp"           , url: "/api/trial/send-email-otp"           , source: "src/api/trial/send-email-otp.ts?fn=POST"              },
  API_011.PATCH    && { cb: API_011.PATCH   , method: "patch"  , route: "/trial/send-email-otp"           , url: "/api/trial/send-email-otp"           , source: "src/api/trial/send-email-otp.ts?fn=PATCH"             },
  API_011.PUT      && { cb: API_011.PUT     , method: "put"    , route: "/trial/send-email-otp"           , url: "/api/trial/send-email-otp"           , source: "src/api/trial/send-email-otp.ts?fn=PUT"               },
  API_011.DELETE   && { cb: API_011.DELETE  , method: "delete" , route: "/trial/send-email-otp"           , url: "/api/trial/send-email-otp"           , source: "src/api/trial/send-email-otp.ts?fn=DELETE"            },
  API_012.default  && { cb: API_012.default , method: "use"    , route: "/trial/send-sms-otp"             , url: "/api/trial/send-sms-otp"             , source: "src/api/trial/send-sms-otp.ts?fn=default"             },
  API_012.USE      && { cb: API_012.USE     , method: "use"    , route: "/trial/send-sms-otp"             , url: "/api/trial/send-sms-otp"             , source: "src/api/trial/send-sms-otp.ts?fn=USE"                 },
  API_012.GET      && { cb: API_012.GET     , method: "get"    , route: "/trial/send-sms-otp"             , url: "/api/trial/send-sms-otp"             , source: "src/api/trial/send-sms-otp.ts?fn=GET"                 },
  API_012.POST     && { cb: API_012.POST    , method: "post"   , route: "/trial/send-sms-otp"             , url: "/api/trial/send-sms-otp"             , source: "src/api/trial/send-sms-otp.ts?fn=POST"                },
  API_012.PATCH    && { cb: API_012.PATCH   , method: "patch"  , route: "/trial/send-sms-otp"             , url: "/api/trial/send-sms-otp"             , source: "src/api/trial/send-sms-otp.ts?fn=PATCH"               },
  API_012.PUT      && { cb: API_012.PUT     , method: "put"    , route: "/trial/send-sms-otp"             , url: "/api/trial/send-sms-otp"             , source: "src/api/trial/send-sms-otp.ts?fn=PUT"                 },
  API_012.DELETE   && { cb: API_012.DELETE  , method: "delete" , route: "/trial/send-sms-otp"             , url: "/api/trial/send-sms-otp"             , source: "src/api/trial/send-sms-otp.ts?fn=DELETE"              },
  API_013.default  && { cb: API_013.default , method: "use"    , route: "/trial/verify-email-otp"         , url: "/api/trial/verify-email-otp"         , source: "src/api/trial/verify-email-otp.ts?fn=default"         },
  API_013.USE      && { cb: API_013.USE     , method: "use"    , route: "/trial/verify-email-otp"         , url: "/api/trial/verify-email-otp"         , source: "src/api/trial/verify-email-otp.ts?fn=USE"             },
  API_013.GET      && { cb: API_013.GET     , method: "get"    , route: "/trial/verify-email-otp"         , url: "/api/trial/verify-email-otp"         , source: "src/api/trial/verify-email-otp.ts?fn=GET"             },
  API_013.POST     && { cb: API_013.POST    , method: "post"   , route: "/trial/verify-email-otp"         , url: "/api/trial/verify-email-otp"         , source: "src/api/trial/verify-email-otp.ts?fn=POST"            },
  API_013.PATCH    && { cb: API_013.PATCH   , method: "patch"  , route: "/trial/verify-email-otp"         , url: "/api/trial/verify-email-otp"         , source: "src/api/trial/verify-email-otp.ts?fn=PATCH"           },
  API_013.PUT      && { cb: API_013.PUT     , method: "put"    , route: "/trial/verify-email-otp"         , url: "/api/trial/verify-email-otp"         , source: "src/api/trial/verify-email-otp.ts?fn=PUT"             },
  API_013.DELETE   && { cb: API_013.DELETE  , method: "delete" , route: "/trial/verify-email-otp"         , url: "/api/trial/verify-email-otp"         , source: "src/api/trial/verify-email-otp.ts?fn=DELETE"          },
  API_014.default  && { cb: API_014.default , method: "use"    , route: "/trial/verify-sms-otp"           , url: "/api/trial/verify-sms-otp"           , source: "src/api/trial/verify-sms-otp.ts?fn=default"           },
  API_014.USE      && { cb: API_014.USE     , method: "use"    , route: "/trial/verify-sms-otp"           , url: "/api/trial/verify-sms-otp"           , source: "src/api/trial/verify-sms-otp.ts?fn=USE"               },
  API_014.GET      && { cb: API_014.GET     , method: "get"    , route: "/trial/verify-sms-otp"           , url: "/api/trial/verify-sms-otp"           , source: "src/api/trial/verify-sms-otp.ts?fn=GET"               },
  API_014.POST     && { cb: API_014.POST    , method: "post"   , route: "/trial/verify-sms-otp"           , url: "/api/trial/verify-sms-otp"           , source: "src/api/trial/verify-sms-otp.ts?fn=POST"              },
  API_014.PATCH    && { cb: API_014.PATCH   , method: "patch"  , route: "/trial/verify-sms-otp"           , url: "/api/trial/verify-sms-otp"           , source: "src/api/trial/verify-sms-otp.ts?fn=PATCH"             },
  API_014.PUT      && { cb: API_014.PUT     , method: "put"    , route: "/trial/verify-sms-otp"           , url: "/api/trial/verify-sms-otp"           , source: "src/api/trial/verify-sms-otp.ts?fn=PUT"               },
  API_014.DELETE   && { cb: API_014.DELETE  , method: "delete" , route: "/trial/verify-sms-otp"           , url: "/api/trial/verify-sms-otp"           , source: "src/api/trial/verify-sms-otp.ts?fn=DELETE"            },
  API_015.default  && { cb: API_015.default , method: "use"    , route: "/users/activate-concierge"       , url: "/api/users/activate-concierge"       , source: "src/api/users/activate-concierge.ts?fn=default"       },
  API_015.USE      && { cb: API_015.USE     , method: "use"    , route: "/users/activate-concierge"       , url: "/api/users/activate-concierge"       , source: "src/api/users/activate-concierge.ts?fn=USE"           },
  API_015.GET      && { cb: API_015.GET     , method: "get"    , route: "/users/activate-concierge"       , url: "/api/users/activate-concierge"       , source: "src/api/users/activate-concierge.ts?fn=GET"           },
  API_015.POST     && { cb: API_015.POST    , method: "post"   , route: "/users/activate-concierge"       , url: "/api/users/activate-concierge"       , source: "src/api/users/activate-concierge.ts?fn=POST"          },
  API_015.PATCH    && { cb: API_015.PATCH   , method: "patch"  , route: "/users/activate-concierge"       , url: "/api/users/activate-concierge"       , source: "src/api/users/activate-concierge.ts?fn=PATCH"         },
  API_015.PUT      && { cb: API_015.PUT     , method: "put"    , route: "/users/activate-concierge"       , url: "/api/users/activate-concierge"       , source: "src/api/users/activate-concierge.ts?fn=PUT"           },
  API_015.DELETE   && { cb: API_015.DELETE  , method: "delete" , route: "/users/activate-concierge"       , url: "/api/users/activate-concierge"       , source: "src/api/users/activate-concierge.ts?fn=DELETE"        },
  API_016.default  && { cb: API_016.default , method: "use"    , route: "/users/create-trial-access"      , url: "/api/users/create-trial-access"      , source: "src/api/users/create-trial-access.ts?fn=default"      },
  API_016.USE      && { cb: API_016.USE     , method: "use"    , route: "/users/create-trial-access"      , url: "/api/users/create-trial-access"      , source: "src/api/users/create-trial-access.ts?fn=USE"          },
  API_016.GET      && { cb: API_016.GET     , method: "get"    , route: "/users/create-trial-access"      , url: "/api/users/create-trial-access"      , source: "src/api/users/create-trial-access.ts?fn=GET"          },
  API_016.POST     && { cb: API_016.POST    , method: "post"   , route: "/users/create-trial-access"      , url: "/api/users/create-trial-access"      , source: "src/api/users/create-trial-access.ts?fn=POST"         },
  API_016.PATCH    && { cb: API_016.PATCH   , method: "patch"  , route: "/users/create-trial-access"      , url: "/api/users/create-trial-access"      , source: "src/api/users/create-trial-access.ts?fn=PATCH"        },
  API_016.PUT      && { cb: API_016.PUT     , method: "put"    , route: "/users/create-trial-access"      , url: "/api/users/create-trial-access"      , source: "src/api/users/create-trial-access.ts?fn=PUT"          },
  API_016.DELETE   && { cb: API_016.DELETE  , method: "delete" , route: "/users/create-trial-access"      , url: "/api/users/create-trial-access"      , source: "src/api/users/create-trial-access.ts?fn=DELETE"       },
  API_017.default  && { cb: API_017.default , method: "use"    , route: "/users/disable-concierge"        , url: "/api/users/disable-concierge"        , source: "src/api/users/disable-concierge.ts?fn=default"        },
  API_017.USE      && { cb: API_017.USE     , method: "use"    , route: "/users/disable-concierge"        , url: "/api/users/disable-concierge"        , source: "src/api/users/disable-concierge.ts?fn=USE"            },
  API_017.GET      && { cb: API_017.GET     , method: "get"    , route: "/users/disable-concierge"        , url: "/api/users/disable-concierge"        , source: "src/api/users/disable-concierge.ts?fn=GET"            },
  API_017.POST     && { cb: API_017.POST    , method: "post"   , route: "/users/disable-concierge"        , url: "/api/users/disable-concierge"        , source: "src/api/users/disable-concierge.ts?fn=POST"           },
  API_017.PATCH    && { cb: API_017.PATCH   , method: "patch"  , route: "/users/disable-concierge"        , url: "/api/users/disable-concierge"        , source: "src/api/users/disable-concierge.ts?fn=PATCH"          },
  API_017.PUT      && { cb: API_017.PUT     , method: "put"    , route: "/users/disable-concierge"        , url: "/api/users/disable-concierge"        , source: "src/api/users/disable-concierge.ts?fn=PUT"            },
  API_017.DELETE   && { cb: API_017.DELETE  , method: "delete" , route: "/users/disable-concierge"        , url: "/api/users/disable-concierge"        , source: "src/api/users/disable-concierge.ts?fn=DELETE"         },
  API_018.default  && { cb: API_018.default , method: "use"    , route: "/users/invite-concierge"         , url: "/api/users/invite-concierge"         , source: "src/api/users/invite-concierge.ts?fn=default"         },
  API_018.USE      && { cb: API_018.USE     , method: "use"    , route: "/users/invite-concierge"         , url: "/api/users/invite-concierge"         , source: "src/api/users/invite-concierge.ts?fn=USE"             },
  API_018.GET      && { cb: API_018.GET     , method: "get"    , route: "/users/invite-concierge"         , url: "/api/users/invite-concierge"         , source: "src/api/users/invite-concierge.ts?fn=GET"             },
  API_018.POST     && { cb: API_018.POST    , method: "post"   , route: "/users/invite-concierge"         , url: "/api/users/invite-concierge"         , source: "src/api/users/invite-concierge.ts?fn=POST"            },
  API_018.PATCH    && { cb: API_018.PATCH   , method: "patch"  , route: "/users/invite-concierge"         , url: "/api/users/invite-concierge"         , source: "src/api/users/invite-concierge.ts?fn=PATCH"           },
  API_018.PUT      && { cb: API_018.PUT     , method: "put"    , route: "/users/invite-concierge"         , url: "/api/users/invite-concierge"         , source: "src/api/users/invite-concierge.ts?fn=PUT"             },
  API_018.DELETE   && { cb: API_018.DELETE  , method: "delete" , route: "/users/invite-concierge"         , url: "/api/users/invite-concierge"         , source: "src/api/users/invite-concierge.ts?fn=DELETE"          },
  API_019.default  && { cb: API_019.default , method: "use"    , route: "/users/list-firebase"            , url: "/api/users/list-firebase"            , source: "src/api/users/list-firebase.ts?fn=default"            },
  API_019.USE      && { cb: API_019.USE     , method: "use"    , route: "/users/list-firebase"            , url: "/api/users/list-firebase"            , source: "src/api/users/list-firebase.ts?fn=USE"                },
  API_019.GET      && { cb: API_019.GET     , method: "get"    , route: "/users/list-firebase"            , url: "/api/users/list-firebase"            , source: "src/api/users/list-firebase.ts?fn=GET"                },
  API_019.POST     && { cb: API_019.POST    , method: "post"   , route: "/users/list-firebase"            , url: "/api/users/list-firebase"            , source: "src/api/users/list-firebase.ts?fn=POST"               },
  API_019.PATCH    && { cb: API_019.PATCH   , method: "patch"  , route: "/users/list-firebase"            , url: "/api/users/list-firebase"            , source: "src/api/users/list-firebase.ts?fn=PATCH"              },
  API_019.PUT      && { cb: API_019.PUT     , method: "put"    , route: "/users/list-firebase"            , url: "/api/users/list-firebase"            , source: "src/api/users/list-firebase.ts?fn=PUT"                },
  API_019.DELETE   && { cb: API_019.DELETE  , method: "delete" , route: "/users/list-firebase"            , url: "/api/users/list-firebase"            , source: "src/api/users/list-firebase.ts?fn=DELETE"             },
  API_020.default  && { cb: API_020.default , method: "use"    , route: "/users/send-regularization-link" , url: "/api/users/send-regularization-link" , source: "src/api/users/send-regularization-link.ts?fn=default" },
  API_020.USE      && { cb: API_020.USE     , method: "use"    , route: "/users/send-regularization-link" , url: "/api/users/send-regularization-link" , source: "src/api/users/send-regularization-link.ts?fn=USE"     },
  API_020.GET      && { cb: API_020.GET     , method: "get"    , route: "/users/send-regularization-link" , url: "/api/users/send-regularization-link" , source: "src/api/users/send-regularization-link.ts?fn=GET"     },
  API_020.POST     && { cb: API_020.POST    , method: "post"   , route: "/users/send-regularization-link" , url: "/api/users/send-regularization-link" , source: "src/api/users/send-regularization-link.ts?fn=POST"    },
  API_020.PATCH    && { cb: API_020.PATCH   , method: "patch"  , route: "/users/send-regularization-link" , url: "/api/users/send-regularization-link" , source: "src/api/users/send-regularization-link.ts?fn=PATCH"   },
  API_020.PUT      && { cb: API_020.PUT     , method: "put"    , route: "/users/send-regularization-link" , url: "/api/users/send-regularization-link" , source: "src/api/users/send-regularization-link.ts?fn=PUT"     },
  API_020.DELETE   && { cb: API_020.DELETE  , method: "delete" , route: "/users/send-regularization-link" , url: "/api/users/send-regularization-link" , source: "src/api/users/send-regularization-link.ts?fn=DELETE"  }
].filter(it => it);

export const routers = internal.map((it) => {
  const { method, route, url, source } = it;
  return { method, url, route, source };
});

export const endpoints = internal.map(
  (it) => it.method?.toUpperCase() + "\t" + it.url
);

export const applyRouters = (applyRouter) => {
  internal.forEach((it) => {
    it.cb = configure.callbackBefore?.(it.cb, it) || it.cb;
    applyRouter(it);
  });
};

