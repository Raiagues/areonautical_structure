# -*- coding: utf-8 -*-
"""
Created on Wed May 10 14:17:50 2023

@author: Emilly Raiane
"""
import PARAMETROS
import RESULTADOS

def calculos_aerodinamica():
    W = PARAMETROS.GRAVIDADE*PARAMETROS.MTOW
    n = PARAMETROS.FATOR_CARGA
    rho = PARAMETROS.DENSIDADE
    V = PARAMETROS.VELOCIDADE
    cd0 = PARAMETROS.CD0
    k = PARAMETROS.K
    b = PARAMETROS.DIM_ENVERG
    c = PARAMETROS.DIM_CORDA
    
    s = b*c
    
    l = n*W
    cl = (2*l)/(rho*s*(V**2))
    cd = cd0+k*(cl**2)
    d = 0.5*rho*cd*s*(V**2)
    
    RESULTADOS.S = s
    RESULTADOS.L = l
    RESULTADOS.D = d
    RESULTADOS.CL = cl
    RESULTADOS.CD = cd

    return l, d, cl, cd, s

