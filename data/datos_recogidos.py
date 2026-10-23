# Datos recogidos el 2026-10-19. Fuente de cada bloque en FUENTES.
FECHA = "2026-10-19"
SLUG = {"Portugal":"portugal","Francia":"france","Italia":"italy","Grecia":"greece","Croacia":"croatia","Noruega":"norway","Islandia":"iceland","República Checa":"czech-republic","Polonia":"poland","Reino Unido":"united-kingdom","Japón":"japan","Corea del Sur":"south-korea","Tailandia":"thailand","Vietnam":"vietnam","Turquía":"turkey","Emiratos Árabes Unidos":"united-arab-emirates","Indonesia":"indonesia","India":"india","Nepal":"nepal","Sri Lanka":"sri-lanka","Estados Unidos":"united-states-of-america","Canadá":"canada","México":"mexico","Costa Rica":"costa-rica","Panamá":"panama","Colombia":"colombia","Perú":"peru","Brasil":"brazil","Argentina":"argentina","Chile":"chile","Marruecos":"morocco","Túnez":"tunisia","Egipto":"egypt","Senegal":"senegal","Kenia":"kenya","Tanzania":"tanzania","Sudáfrica":"south-africa","Seychelles":"seychelles","Australia":"australia","Nueva Zelanda":"new-zealand"}
ISO2 = {"Portugal":"pt","Francia":"fr","Italia":"it","Grecia":"gr","Croacia":"hr","Noruega":"no","Islandia":"is","República Checa":"cz","Polonia":"pl","Reino Unido":"gb","Japón":"jp","Corea del Sur":"kr","Tailandia":"th","Vietnam":"vn","Turquía":"tr","Emiratos Árabes Unidos":"ae","Indonesia":"id","India":"in","Nepal":"np","Sri Lanka":"lk","Estados Unidos":"us","Canadá":"ca","México":"mx","Costa Rica":"cr","Panamá":"pa","Colombia":"co","Perú":"pe","Brasil":"br","Argentina":"ar","Chile":"cl","Marruecos":"ma","Túnez":"tn","Egipto":"eg","Senegal":"sn","Kenia":"ke","Tanzania":"tz","Sudáfrica":"za","Seychelles":"sc","Australia":"au","Nueva Zelanda":"nz"}
USD_EUR = 165/188  # cociente que publica budgetyourtrip para Portugal el 2026-10-19
GASTRO = {"Portugal":1,"Francia":1,"Italia":3,"Grecia":2,"Croacia":0,"Noruega":1,"Islandia":0,"República Checa":0,"Polonia":0,"Reino Unido":0,"Japón":2,"Corea del Sur":2,"Tailandia":3,"Vietnam":0,"Turquía":3,"Emiratos Árabes Unidos":0,"Indonesia":0,"India":2,"Nepal":0,"Sri Lanka":0,"Estados Unidos":2,"Canadá":1,"México":2,"Costa Rica":0,"Panamá":1,"Colombia":2,"Perú":1,"Brasil":4,"Argentina":0,"Chile":0,"Marruecos":0,"Túnez":0,"Egipto":0,"Senegal":0,"Kenia":0,"Tanzania":0,"Sudáfrica":1,"Seychelles":0,"Australia":2,"Nueva Zelanda":0}
# EF EPI 2025: (banda, puesto, puntos); None = no aparece en el ranking
EF = {"Portugal":("Muy alto",6,612),"Francia":("Moderado",38,539),"Italia":("Moderado",59,513),"Grecia":("Alto",20,592),"Croacia":("Muy alto",2,617),"Noruega":("Muy alto",5,613),"Islandia":None,"República Checa":("Alto",23,582),"Polonia":("Muy alto",15,600),"Reino Unido":None,"Japón":("Muy bajo",97,446),"Corea del Sur":("Moderado",48,522),"Tailandia":("Muy bajo",116,402),"Vietnam":("Moderado",64,500),"Turquía":("Bajo",71,488),"Emiratos Árabes Unidos":("Bajo",72,487),"Indonesia":("Bajo",80,471),"India":("Bajo",74,484),"Nepal":("Moderado",58,514),"Sri Lanka":("Bajo",73,486),"Estados Unidos":None,"Canadá":None,"México":("Muy bajo",103,440),"Costa Rica":("Moderado",55,516),"Panamá":("Bajo",70,491),"Colombia":("Bajo",76,480),"Perú":("Moderado",52,519),"Brasil":("Bajo",75,482),"Argentina":("Alto",26,575),"Chile":("Moderado",54,517),"Marruecos":("Bajo",69,492),"Túnez":("Bajo",66,498),"Egipto":("Bajo",89,459),"Senegal":("Muy bajo",102,442),"Kenia":("Alto",19,593),"Tanzania":("Bajo",77,479),"Sudáfrica":("Muy alto",13,602),"Seychelles":None,"Australia":None,"Nueva Zelanda":None}
# Global Peace Index 2026: (puesto, puntuación); None = no listado
GPI = {"Portugal":(7,1.427),"Francia":(99,2.083),"Italia":(35,1.712),"Grecia":(53,1.828),"Croacia":(23,1.619),"Noruega":(33,1.688),"Islandia":(1,1.161),"República Checa":(13,1.517),"Polonia":(22,1.615),"Reino Unido":(39,1.730),"Japón":(10,1.489),"Corea del Sur":(57,1.839),"Tailandia":(101,2.089),"Vietnam":(41,1.738),"Turquía":(136,2.605),"Emiratos Árabes Unidos":(73,1.927),"Indonesia":(69,1.918),"India":(127,2.409),"Nepal":(111,2.143),"Sri Lanka":(67,1.910),"Estados Unidos":(134,2.535),"Canadá":(14,1.525),"México":(139,2.650),"Costa Rica":(62,1.860),"Panamá":(81,1.976),"Colombia":(141,2.735),"Perú":(107,2.120),"Brasil":(124,2.333),"Argentina":(72,1.922),"Chile":(52,1.826),"Marruecos":(65,1.887),"Túnez":(77,1.947),"Egipto":(113,2.186),"Senegal":(75,1.939),"Kenia":(132,2.447),"Tanzania":(98,2.080),"Sudáfrica":(123,2.308),"Seychelles":None,"Australia":(20,1.602),"Nueva Zelanda":(2,1.343)}
def seguridad(p):
    g = GPI[p]
    if g is None: return None
    return "Bajo riesgo" if g[1] < 1.75 else ("Riesgo medio" if g[1] <= 2.30 else "Riesgo alto")
SIN_T, AUT, VLL, VEL = "Sin trámite previo", "Autorización electrónica", "Visado a la llegada", "Visado electrónico"
ENTRADA = {p:(SIN_T,"") for p in SLUG}
ENTRADA.update({
 "Reino Unido":(AUT,"ETA obligatoria desde 2025-04-02 (ficha MAEC)"),"Estados Unidos":(AUT,"ESTA; pasaporte con chip biométrico"),
 "Canadá":(AUT,"eTA obligatoria"),"Kenia":(AUT,"eTA obligatoria, solo web oficial"),"Seychelles":(AUT,"Autorización de viaje online antes de embarcar"),
 "Nueva Zelanda":(AUT,"NZeTA obligatoria"),"Australia":(AUT,"Visado electrónico (ETA) sin etiqueta en pasaporte; se tramita online"),
 "Sri Lanka":(AUT,"ETA gratuita para españoles desde 2026-05-25"),
 "Nepal":(VLL,"Visado a la llegada o online; pago de tasa en efectivo recomendado"),"Indonesia":(VLL,"Visado a la llegada 30 días prorrogables; 500.000 IDR"),
 "Tanzania":(VEL,"Visado online o en frontera"),"Egipto":(VEL,"Visado obligatorio (e-visa o a la llegada); comprobar"),"India":(VEL,"Visado obligatorio, e-Visa online; comprobar"),
})
ENTRADA["Tailandia"]=(SIN_T,"Sin visado turismo; tarjeta digital de llegada TDAC obligatoria")
ENTRADA["Corea del Sur"]=(SIN_T,"K-ETA suspendida hasta 2026-12-31; 90 días")
ENTRADA["Vietnam"]=(SIN_T,"Texto de la ficha incompleto; comprobar exención y días")
ENTRADA["Turquía"]=(SIN_T,"Exentos desde 2020-03-02")
ENTRADA["Sudáfrica"]=(SIN_T,"Exención según lista del Ministerio de Interior; comprobar")
ENTRADA["Argentina"]=(SIN_T,"Hasta 90 días por turismo")
ENTRADA["Chile"]=(SIN_T,"Hasta 90 días; solo pasaporte")
ENTRADA["Brasil"]=(SIN_T,"Solo pasaporte (6 meses de validez)")
ENTRADA["Perú"]=(SIN_T,"Texto de la ficha parcial; comprobar")
ENTRADA["Panamá"]=(SIN_T,"Texto de la ficha parcial; billete de regreso exigido")
ENTRADA["México"]=(SIN_T,"Texto de la ficha parcial; comprobar")
ENTRADA["Túnez"]=(SIN_T,"Texto de la ficha parcial; comprobar")
SAN_REL = {"Argentina":"fiebre amarilla en regiones concretas","Brasil":"fiebre amarilla (casos recientes en varios estados)","India":"hepatitis A y B, tifoidea","Indonesia":"hepatitis, tifoidea, malaria, encefalitis, polio","Nepal":"tifoidea","Tailandia":"hepatitis A y B, rabia, encefalitis japonesa","Panamá":"hepatitis, meningitis, tifoidea, rabia, fiebre amarilla","Perú":"fiebre amarilla (selva), tifoidea, hepatitis","Senegal":"fiebre amarilla, hepatitis, paludismo"}
SAN_NOTAS = {"Egipto":"Certificado de fiebre amarilla solo si se procede de país de riesgo (no aplica desde España)","Sudáfrica":"Certificado de fiebre amarilla solo si se procede de país de riesgo","Francia":"Malaria solo en territorios de ultramar","Polonia":"Recomienda vacuna de encefalitis por garrapatas en zonas verdes","República Checa":"Encefalitis por garrapatas en zonas verdes","Corea del Sur":"Hepatitis B en estancias largas"}
SAN_VACIO = {"Kenia","Tanzania","Vietnam","Sri Lanka"}
PLAYA_SI = {"Portugal","Francia","Italia","Grecia","Croacia","Turquía","Emiratos Árabes Unidos","Tailandia","Vietnam","Indonesia","India","Sri Lanka","Estados Unidos","México","Costa Rica","Panamá","Colombia","Brasil","Marruecos","Túnez","Egipto","Senegal","Kenia","Tanzania","Sudáfrica","Seychelles","Australia"}
EURO = {"Portugal","Francia","Italia","Grecia","Croacia"}
