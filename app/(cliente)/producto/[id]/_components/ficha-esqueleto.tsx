import { AtSkeleton } from "@/ui/atomic";

/** Carga de la ficha: misma rejilla que la ficha real (galería + panel), para que nada salte al llegar los datos. */
export function FichaEsqueleto() {
  return (
    <div aria-busy="true" className="mx-auto w-full max-w-[1296px]">
      <span className="sr-only" role="status">
        Cargando el producto…
      </span>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,585fr)_minmax(0,681fr)] lg:items-start xl:gap-[29px]">
        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[72px_minmax(0,1fr)] lg:gap-4 xl:grid-cols-[92px_minmax(0,1fr)] xl:gap-[19px]">
          <AtSkeleton className="aspect-[4/3] w-full rounded-card sm:aspect-[16/11] lg:order-2 lg:aspect-[474/544]" />
          <div className="flex gap-2 p-1 lg:order-1 lg:flex-col">
            {Array.from({ length: 4 }, (_, i) => (
              <AtSkeleton key={i} className="aspect-[92/102] w-[72px] shrink-0 rounded-[6px] lg:w-full xl:w-[92px]" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-[22px] rounded-card bg-content1 px-5 py-7 sm:px-8 sm:py-9 xl:px-[47px] xl:py-[39px]">
          <div className="flex justify-between">
            <AtSkeleton className="h-6 w-20 rounded-full" />
            <AtSkeleton className="h-[27px] w-[170px] rounded-full" />
          </div>
          <AtSkeleton className="h-10 w-4/5 rounded-full" />
          <AtSkeleton className="h-10 w-3/5 rounded-full" />
          <div className="flex flex-col gap-2">
            <AtSkeleton className="h-3.5 w-full rounded-full" />
            <AtSkeleton className="h-3.5 w-full rounded-full" />
            <AtSkeleton className="h-3.5 w-2/3 rounded-full" />
          </div>
          <AtSkeleton className="mt-3 h-[46px] w-full rounded-control" />
          <div className="flex gap-[18px]">
            <AtSkeleton className="h-[37px] w-[137px] rounded-full" />
            <AtSkeleton className="h-[37px] flex-1 rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <AtSkeleton className="h-4 w-28 rounded-full" />
            <AtSkeleton className="h-[52px] w-[138px] rounded-control" />
          </div>
        </div>
      </div>
    </div>
  );
}
