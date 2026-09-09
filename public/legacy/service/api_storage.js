export const API_STORAGE = Object.freeze({

    TRIP: {
        create: "/api/v1.0/trip",
        get_list: "/api/v1.0/trip/view",
        home_view: "/api/v1.0/trip/home_view",
        get_detail: "/api/v1.0/trip/detail/{id}",
        update: "/api/v1.0/trip/{tripId}",
        delete: "/api/v1.0/trip/{tripId}",
    },
    FINANCE: {
        create: "/api/v1.0/finance",
        get_detail: "/api/v1.0/finance/detail/{id}",
        expense_create: "/api/v1.0/finance/expense",
        expense_get_list: "/api/v1.0/finance/expense_view/{tripId}",
        expense_general: "/api/v1.0/finance/expense_general/{tripId}",
    },
    ITINERARY: {
        create: "/api/v1.0/itinerary",
        get_list: "/api/v1.0/itinerary/list_view",
        activity_create: "/api/v1.0/itinerary/activity",
        activity_get_list: "/api/v1.0/itinerary/activity/list_view",
    },
    COMPANION: {
        get_list: "/api/v1.0/companion/list_view",
        invite: "/api/v1.0/companion/{tripId}/invite",
        list_invites: "/api/v1.0/companion/invite",
    }
});