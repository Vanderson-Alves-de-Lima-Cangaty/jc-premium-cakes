import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArtTile } from "@/components/ArtTile";
import { formatMoney } from "@/lib/money";

export interface ProductCardProps {
  title: string;
  subtitle?: string;
  price?: number;
  href: string;
  tag?: string;
  seed?: string;
}

export function ProductCard(props: ProductCardProps) {
  return (
    <Link
      href={props.href}
      className="group block rounded-2xl transition-all duration-200 ease-in-out-circ hover:!scale-[1.02] active:scale-[0.99]"
    >
      <Card className="flex h-full flex-col transition-shadow duration-200 group-hover:shadow-medium">
        <CardContent className="flex flex-1 flex-col p-4">
          <ArtTile
            seed={props.seed ?? props.title}
            label={props.title}
            className="mb-4"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                {props.title}
              </h3>
              {props.tag && <Badge>{props.tag}</Badge>}
            </div>
            {props.subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">
                {props.subtitle}
              </p>
            )}
          </div>
          {props.price != null && (
            <div className="mt-4 text-lg font-semibold text-foreground">
              A partir de{" "}
              <span className="font-extrabold text-primary">
                {formatMoney(props.price)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
