import { UserButton } from "@clerk/nextjs";

import { getApiLimitCount } from "@/lib/apiLimit";
import { checkSubscription } from "@/lib/subsciption";
import MobileSidebar from "@/components/mobileSidebar";

const Navbar = async () => {
    const apiLimitCount = await getApiLimitCount();
    const isPro = await checkSubscription();
    return (
        <div className="flex items-center p-4">
            <MobileSidebar apiLimitCount={apiLimitCount} isPro={isPro} />
            <div className="flex w-full justify-end">
                <UserButton afterSignOutUrl="/" />
            </div>
        </div>
    );
}

export default Navbar;