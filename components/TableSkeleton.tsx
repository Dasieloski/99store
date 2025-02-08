export function TableSkeleton() {
    return (
        <div className="rounded-md border">
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {[...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4">
                                <div className="h-12 w-12 animate-pulse rounded bg-muted"></div>
                            </td>
                            <td className="p-4">
                                <div className="h-4 w-[250px] animate-pulse rounded bg-muted"></div>
                            </td>
                            <td className="p-4">
                                <div className="h-4 w-[100px] animate-pulse rounded bg-muted"></div>
                            </td>
                            <td className="p-4">
                                <div className="h-4 w-[100px] animate-pulse rounded bg-muted"></div>
                            </td>
                            <td className="p-4">
                                <div className="h-4 w-[50px] animate-pulse rounded bg-muted"></div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
