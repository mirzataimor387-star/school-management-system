import { NextResponse } from "next/server";
import { getAuthUser } from "./getAuthUser";

/**
 * @param roles allowed roles
 * @param options { campusKey, classKey }
 */
export function withRBAC(roles = [], options = {}) {
    return async (req, handler) => {
        const user = await getAuthUser(req);

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        // role check
        if (!roles.includes(user.role)) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        // super admin bypass
        if (user.role === "super_admin") {
            return handler(req, user);
        }

        const { campusId } = user;

        // campus guard
        if (options.campusKey) {
            const body = await req.json();
            const resourceCampusId = body[options.campusKey];

            if (
                resourceCampusId &&
                resourceCampusId.toString() !== campusId.toString()
            ) {
                return NextResponse.json(
                    { message: "Campus access denied" },
                    { status: 403 }
                );
            }
        }

        return handler(req, user);
    };
}
