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
    cm = -0.078

    s = b*c
        
    l = n*W
    cl = (2*l)/(rho*s*(V**2))
    cd = cd0+k*(cl**2)
    d = 0.5*rho*cd*s*(V**2)
    m = 0.5*rho*(V**2)*cm*s*c
        
    RESULTADOS.S = s
    RESULTADOS.L = l
    RESULTADOS.D = d
    RESULTADOS.M = m
    RESULTADOS.CL = cl
    RESULTADOS.CD = cd
    RESULTADOS.CM = cm
    
    return l, d, cl, cd, m, cm