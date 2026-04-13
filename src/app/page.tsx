import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const kpis = [
  { label: "Idempotence", value: "ON", hint: "Upsert by snapshot key" },
  { label: "Odd-day sync", value: "ENFORCED", hint: "Skip even day snapshots" },
  { label: "Source", value: "YOXO", hint: "Bearer API key auth" },
  { label: "Route", value: "/api/sync", hint: "Protected by CRON secret" },
];

const sampleRows = [
  {
    server: "mocha",
    date: "2026-04-13",
    cereals: 8,
    avgPrice: "$123.42",
    action: "BUY",
    confidence: "68%",
  },
  {
    server: "vanilla",
    date: "2026-04-11",
    cereals: 8,
    avgPrice: "$131.18",
    action: "HOLD",
    confidence: "61%",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-5 px-4 py-6 text-foreground sm:px-6">
      <section className="rounded-2xl border border-white/10 bg-card/70 p-5 backdrop-blur">
        <div className="mb-3 flex items-center gap-2">
          <Badge>NGCrops MVP</Badge>
          <Badge variant="outline">Dark dashboard</Badge>
          <Badge variant="secondary">shadcn/ui</Badge>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          NationsGlory cereal market snapshot control panel
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          The pipeline is built for deterministic and idempotent syncs: Yoxo data
          is normalized, grouped by server + date, filtered on odd-day snapshots,
          then upserted by a stable snapshot key.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-card/70">
            <CardHeader>
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle>{kpi.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">{kpi.hint}</CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-card/70 lg:col-span-2">
          <CardHeader>
            <CardTitle>Latest snapshots (sample)</CardTitle>
            <CardDescription>
              Final data comes from MongoDB after running the secure sync route.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Server</TableHead>
                  <TableHead>Snapshot date</TableHead>
                  <TableHead>Cereals</TableHead>
                  <TableHead>Avg. price</TableHead>
                  <TableHead>Reco</TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleRows.map((row) => (
                  <TableRow key={`${row.server}-${row.date}`}>
                    <TableCell>{row.server}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.cereals}</TableCell>
                    <TableCell>{row.avgPrice}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.action === "BUY"
                            ? "default"
                            : row.action === "SELL"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {row.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.confidence}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-card/70">
          <CardHeader>
            <CardTitle>Sync checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Set `YOXO_API_KEY` and `CRON_SECRET` in `.env.local`.</p>
            <p>2. Call `POST /api/sync` with `x-cron-secret` header.</p>
            <p>3. Ensure current snapshot day is odd, otherwise skipped.</p>
            <p>4. Re-run sync safely: existing snapshot keys are upserted.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
