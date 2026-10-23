from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter

paises = [
("Portugal","Europa","Europa Sur"),("Francia","Europa","Europa Occidental"),("Italia","Europa","Europa Sur"),
("Grecia","Europa","Europa Sur"),("Croacia","Europa","Europa Sur"),("Noruega","Europa","Europa Norte"),
("Islandia","Europa","Europa Norte"),("República Checa","Europa","Europa Central"),("Polonia","Europa","Europa Central"),
("Reino Unido","Europa","Europa Occidental"),
("Japón","Asia","Asia Oriental"),("Corea del Sur","Asia","Asia Oriental"),("Tailandia","Asia","Sudeste Asiático"),
("Vietnam","Asia","Sudeste Asiático"),("Turquía","Asia","Asia Occidental"),("Emiratos Árabes Unidos","Asia","Asia Occidental"),
("Indonesia","Asia","Sudeste Asiático"),("India","Asia","Asia Meridional"),("Nepal","Asia","Asia Meridional"),
("Sri Lanka","Asia","Asia Meridional"),
("Estados Unidos","América","América del Norte"),("Canadá","América","América del Norte"),("México","América","América del Norte"),
("Costa Rica","América","América Central"),("Panamá","América","América Central"),("Colombia","América","América del Sur"),
("Perú","América","América del Sur"),("Brasil","América","América del Sur"),("Argentina","América","América del Sur"),
("Chile","América","América del Sur"),
("Marruecos","África y Oceanía","África del Norte"),("Túnez","África y Oceanía","África del Norte"),
("Egipto","África y Oceanía","África del Norte"),("Senegal","África y Oceanía","África Occidental"),
("Kenia","África y Oceanía","África Oriental"),("Tanzania","África y Oceanía","África Oriental"),
("Sudáfrica","África y Oceanía","África Austral"),("Seychelles","África y Oceanía","África Oriental"),
("Australia","África y Oceanía","Oceanía"),("Nueva Zelanda","África y Oceanía","Oceanía"),
]
assert len(paises)==40 and len({p[0] for p in paises})==40

# clave, nombre, tipo, unidad, valores permitidos, fuente, nota
attrs = [
("coste_diario","Coste diario medio","número","€/día","> 0","Budget Your Trip (gasto medio diario por viajero)","Valor en USD de la web convertido a EUR con el cociente que publica la propia web para Portugal (165/188 = 0,878) el 2026-10-19. Incluye alojamiento, comida y transporte local."),
("horas_vuelo","Horas de vuelo desde Madrid","número","horas","> 0","Cálculo propio por distancia","Anotar fórmula y velocidad media usadas. Sin escalas, estimado."),
("entrada_espanoles","Requisito de entrada para españoles","categoría","-","Sin trámite previo | Autorización electrónica | Visado a la llegada | Visado electrónico | Visado consular","Ministerio de Asuntos Exteriores (ficha del país)","Estancia turística corta. Nivel de trámite derivado: Sin trámite previo 0, Autorización electrónica 1, Visado a la llegada 2, Visado electrónico 2, Visado consular 3."),
("seguridad","Nivel de seguridad","categoría","-","Bajo riesgo | Riesgo medio | Riesgo alto","Global Peace Index 2026 (Institute for Economics and Peace)","Umbral propio: puntuación GPI < 1,75 Bajo riesgo; 1,75 a 2,30 Riesgo medio; > 2,30 Riesgo alto. Sin puntuación: SIN DATO."),
("sanitarios","Requisitos sanitarios","categoría","-","Ninguno obligatorio | Vacuna obligatoria | Recomendaciones relevantes","Ministerio de Asuntos Exteriores (ficha del país, apartado Vacunas)","Vacuna obligatoria = exigida a viajeros procedentes de España. Recomendaciones relevantes = la ficha recomienda vacunas o profilaxis por riesgo endémico (fiebre amarilla, tifoidea, malaria, rabia, hepatitis)."),
("patrimonio_cultural","Sitios culturales UNESCO","número","nº","entero >= 0","UNESCO World Heritage List","Contar sitios culturales; los mixtos van en ambos conteos (anotarlo)."),
("naturaleza","Sitios naturales UNESCO","número","nº","entero >= 0","UNESCO World Heritage List","Contar sitios naturales; los mixtos van en ambos conteos (anotarlo)."),
("gastronomia","Gastronomía reconocida (UNESCO)","número","nº","entero >= 0","UNESCO Creative Cities Network (gastronomía)","Solo cuenta Ciudades Creativas de Gastronomía por país. Es un proxy: solo mide lo reconocido por UNESCO."),
("ingles","Nivel de inglés","categoría","-","Muy alto | Alto | Moderado | Bajo | Muy bajo | SIN DATO","EF English Proficiency Index","Países no clasificados: SIN DATO."),
("moneda_euro","Moneda: usa euro","sí/no","-","Sí | No","Fuente oficial (Banco Central Europeo / Unión Europea)",""),
("playa","Playa turística","sí/no","-","Sí | No","Web oficial de turismo del país","Definición objetiva a fijar por escrito (ej.: costa con playas promocionadas por el organismo oficial de turismo)."),
("temperatura","Temperatura media mensual","número x12","°C","-50 a 60","Banco Mundial: Climate Change Knowledge Portal","Hoja Clima. Un valor por mes."),
("precipitacion","Precipitación mensual","número x12","mm","entero >= 0","Banco Mundial: Climate Change Knowledge Portal","Hoja Clima. Un valor por mes."),
]
datos_attrs = [a for a in attrs if a[0] not in ("temperatura","precipitacion")]

wb = Workbook()
hdr = PatternFill("solid", fgColor="1F3864"); hf = Font(bold=True, color="FFFFFF")
def header(ws, cols, widths):
    ws.append(cols)
    for i,c in enumerate(cols,1):
        cell=ws.cell(row=1,column=i); cell.fill=hdr; cell.font=hf; cell.alignment=Alignment(wrap_text=True,vertical="center")
        ws.column_dimensions[get_column_letter(i)].width=widths[i-1]
    ws.freeze_panes="A2"

ws = wb.active; ws.title="Países"
header(ws,["N.º","País","Zona","Subzona"],[6,26,22,22])
for i,(p,z,s) in enumerate(paises,1): ws.append([i,p,z,s])

ws = wb.create_sheet("Criterio")
for line in ["Criterio de selección de los 40 países",
 "1. 10 países por zona: Europa, Asia, América, África y Oceanía.",
 "2. Accesibles en vuelo (directo o con escalas) desde España.",
 "3. Con ficha de recomendaciones de viaje en el Ministerio de Asuntos Exteriores y variedad de precio, distancia, clima y tipo de viaje.",
 "Cambios respecto a la primera lista: Camboya sustituida por Turquía y Malasia por Emiratos Árabes Unidos (reducir sesgo de sudeste asiático y cubrir Oriente Medio)."]:
    ws.append([line])
ws.column_dimensions["A"].width=140; ws["A1"].font=Font(bold=True)

ws = wb.create_sheet("Atributos")
header(ws,["Clave","Atributo","Tipo","Unidad","Valores permitidos","Fuente","Nota"],[20,36,12,10,50,50,70])
for a in attrs: ws.append(list(a))

ws = wb.create_sheet("Datos")
cols=["País","Clave atributo","Atributo","Valor","Unidad","URL de la fuente","Fecha de consulta (AAAA-MM-DD)","Verificado (Sí/No)","Observaciones"]
header(ws,cols,[24,20,36,24,10,60,18,14,50])
for p,_,_ in paises:
    for k,n,t,u,v,f,nt in datos_attrs:
        ws.append([p,k,n,None,u,None,None,"No",None])
dv = DataValidation(type="list", formula1='"Sí,No"', allow_blank=True); ws.add_data_validation(dv); dv.add(f"H2:H{ws.max_row}")
# listas por atributo
for k,n,t,u,v,f,nt in datos_attrs:
    if t in ("categoría","sí/no") and "|" in v:
        lst = ",".join(x.strip() for x in v.split("|"))
        d = DataValidation(type="list", formula1=f'"{lst}"', allow_blank=True); ws.add_data_validation(d)
        for r in range(2, ws.max_row+1):
            if ws.cell(row=r,column=2).value==k: d.add(f"D{r}")

ws = wb.create_sheet("Clima")
meses=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
cols=["País"]+[f"T_{m} (°C)" for m in meses]+[f"P_{m} (mm)" for m in meses]+["URL de la fuente","Fecha de consulta (AAAA-MM-DD)","Verificado (Sí/No)","Observaciones"]
header(ws,cols,[24]+[9]*24+[60,18,14,40])
for p,_,_ in paises: ws.append([p]+[None]*24+[None,None,"No",None])
dv2 = DataValidation(type="list", formula1='"Sí,No"', allow_blank=True); ws.add_data_validation(dv2); dv2.add(f"AB2:AB{ws.max_row}")


import sys, json
sys.path.insert(0, ".")
import datos_recogidos as D
unesco = json.load(open("unesco.json", encoding="utf-8"))
vuelos = json.load(open("vuelos.json", encoding="utf-8"))
clima = json.load(open("clima.json", encoding="utf-8"))
coste = json.load(open("coste_usd.json", encoding="utf-8"))
MAEC = "https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Recomendaciones-de-viaje.aspx"
def valores(p):
    c, n, m = unesco[p]
    ef = D.EF[p]; g = D.GPI[p]; ent = D.ENTRADA[p]
    v = {}
    if coste[p] is not None:
        v["coste_diario"] = (round(coste[p]*D.USD_EUR), "https://www.budgetyourtrip.com/"+D.SLUG[p], f"{coste[p]} USD/día convertidos a EUR")
    vu = vuelos[p]
    v["horas_vuelo"] = (round(vu["horas"],1), "Cálculo propio: distancia Madrid-"+vu["ciudad"]+" (haversine, "+str(round(vu["km"]))+" km) / 800 km/h + 0,5 h", "Sin escalas, estimado")
    v["entrada_espanoles"] = (ent[0], MAEC, ent[1])
    if g: v["seguridad"] = (D.seguridad(p), "https://www.visionofhumanity.org/maps/", f"GPI 2026: puesto {g[0]}, puntuación {g[1]}")
    if p not in D.SAN_VACIO:
        if p in D.SAN_REL: v["sanitarios"] = ("Recomendaciones relevantes", MAEC, D.SAN_REL[p])
        else: v["sanitarios"] = ("Ninguno obligatorio", MAEC, D.SAN_NOTAS.get(p, ""))
    v["patrimonio_cultural"] = (c+m, "https://whc.unesco.org/en/statesparties/"+D.ISO2[p], f"culturales {c} + mixtos {m}")
    v["naturaleza"] = (n+m, "https://whc.unesco.org/en/statesparties/"+D.ISO2[p], f"naturales {n} + mixtos {m}")
    v["gastronomia"] = (D.GASTRO[p], "https://en.wikipedia.org/wiki/City_of_Gastronomy", "Ciudades Creativas de Gastronomía UNESCO")
    if ef: v["ingles"] = (ef[0], "https://www.ef.com/wwen/epi/", f"EF EPI 2025: puesto {ef[1]}, {ef[2]} puntos")
    v["moneda_euro"] = ("Sí" if p in D.EURO else "No", "https://european-union.europa.eu/institutions-law-budget/euro/countries-using-euro_en", "")
    v["playa"] = ("Sí" if p in D.PLAYA_SI else "No", "Criterio propio (ver memoria): costa con playas de baño como oferta turística principal", "")
    return v
ws = wb["Datos"]
for r in range(2, ws.max_row+1):
    p, k = ws.cell(row=r,column=1).value, ws.cell(row=r,column=2).value
    v = valores(p).get(k)
    if v:
        ws.cell(row=r,column=4,value=v[0]); ws.cell(row=r,column=6,value=v[1]); ws.cell(row=r,column=7,value=D.FECHA)
        if v[2]: ws.cell(row=r,column=9,value=v[2])
ws = wb["Clima"]
for r in range(2, ws.max_row+1):
    p = ws.cell(row=r,column=1).value
    t, pr = clima[p]
    for i,x in enumerate(t+pr): ws.cell(row=r,column=2+i,value=x)
    ws.cell(row=r,column=26,value="https://climateknowledgeportal.worldbank.org/"); ws.cell(row=r,column=27,value=D.FECHA)
    ws.cell(row=r,column=29,value="CRU TS 4.09, climatología 1991-2020, media nacional (API cckpapi.worldbank.org)")

# columnas del esquema del compañero: periodo_referencia, metodo_obtencion, calidad
META = {
 "coste_diario": ("Media de gasto de viajeros, web consultada 2026-10-19", "Observado en web; USD convertido a EUR", "estimado"),
 "horas_vuelo": ("n/a", "Calculado: distancia haversine / 800 km/h + 0,5 h; sin escalas (falta duración real y con escalas)", "estimado"),
 "entrada_espanoles": ("Vigente a 2026-10-19; puede cambiar", "Clasificación propia a partir de la ficha MAEC", "estimado"),
 "seguridad": ("Edición 2026", "Escala propia con umbrales sobre la puntuación GPI (no es un aviso oficial)", "estimado"),
 "sanitarios": ("Vigente a 2026-10-19; puede cambiar", "Clasificación propia a partir de la ficha MAEC", "estimado"),
 "patrimonio_cultural": ("Lista UNESCO vigente a 2026-10-19", "Contado en la página oficial de cada Estado parte; mixtos en ambos conteos; bienes transfronterizos cuentan en cada país", "verificado"),
 "naturaleza": ("Lista UNESCO vigente a 2026-10-19", "Contado en la página oficial de cada Estado parte; mixtos en ambos conteos; bienes transfronterizos cuentan en cada país", "verificado"),
 "gastronomia": ("Red de Ciudades Creativas, lista consultada 2026-10-19", "Recuento desde Wikipedia (no la web de UNESCO)", "estimado"),
 "ingles": ("EF EPI edición 2025", "Banda de EF EPI según Wikipedia; la puntuación no mide a toda la población", "estimado"),
 "moneda_euro": ("Vigente a 2026-10-19", "Lista de países del euro (UE)", "verificado"),
 "playa": ("n/a", "Criterio propio: costa con playas de baño como oferta turística principal", "estimado"),
}
ws = wb["Datos"]
for i, h in enumerate(["Periodo de referencia", "Método de obtención", "Calidad (verificado/estimado/SIN DATO)"], 10):
    c = ws.cell(row=1, column=i, value=h); c.fill = hdr; c.font = hf; c.alignment = Alignment(wrap_text=True, vertical="center")
    ws.column_dimensions[get_column_letter(i)].width = [30, 60, 18][i-10]
for r in range(2, ws.max_row+1):
    k = ws.cell(row=r, column=2).value
    if ws.cell(row=r, column=4).value in (None, ""):
        ws.cell(row=r, column=10, value="SIN DATO"); ws.cell(row=r, column=12, value="SIN DATO")
    else:
        m = META[k]
        for j in range(3): ws.cell(row=r, column=10+j, value=m[j])
ws = wb["Clima"]
for i, h in enumerate(["Periodo de referencia", "Método de obtención", "Calidad (verificado/estimado/SIN DATO)"], 30):
    c = ws.cell(row=1, column=i, value=h); c.fill = hdr; c.font = hf; c.alignment = Alignment(wrap_text=True, vertical="center")
    ws.column_dimensions[get_column_letter(i)].width = [26, 50, 18][i-30]
for r in range(2, ws.max_row+1):
    ws.cell(row=r, column=30, value="1991-2020 (climatología)")
    ws.cell(row=r, column=31, value="Dato observado reanalizado CRU TS 4.09 vía API del Banco Mundial; media nacional, no estación local")
    ws.cell(row=r, column=32, value="verificado")

wb.save("plantilla_datos_40_paises.xlsx")
print("ok", len(datos_attrs)*40, "filas en Datos")
