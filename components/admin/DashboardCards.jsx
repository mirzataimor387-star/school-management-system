import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function DashboardCards() {
    return (
        <div className="grid md:grid-cols-4 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Total Students</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">
                    450
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Teachers</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">
                    25
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Present Today</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold text-green-600">
                    420
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Fees</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold text-red-600">
                    Rs. 85,000
                </CardContent>
            </Card>
        </div>
    );
}
