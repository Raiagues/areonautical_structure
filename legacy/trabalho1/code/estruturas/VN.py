# -*- coding: utf-8 -*-
"""
Created on Thu Jun  8 20:21:03 2023

@author: Emilly Raiane
"""

import numpy as np
import matplotlib.pyplot as plt

import PARAMETROS
import RESULTADOS

def vn():
    W = PARAMETROS.GRAVIDADE*PARAMETROS.MTOW
    rho = PARAMETROS.DENSIDADE
    s = RESULTADOS.S
    
    x1 = [100, 180, 180, 140, 80]
    y1 = [7.5, 7.5, -1.06, -3, -3]
    
    x2 = [100, 180, 180, 80]
    y2 = [7.5, 7.5, -3, -3]
    
    V1 = 100
    n1 = 7.5
    L1 = n1*W
    
    CLmaxpos = 2*L1/(rho*s*V1**2)
    
    V2 = 80
    n2 = -3
    L2 = n2*W
    
    CLmaxneg = 2*L2/(rho*s*V2**2)
    
    Vlinpos = np.linspace(0,100,50)
    Vlinneg = np.linspace(0,80,50)
    
    ntestpos = CLmaxpos*0.5*rho*Vlinpos**2*s/W
    ntestneg = CLmaxneg*0.5*rho*Vlinneg**2*s/W
    
    x_intercept_pos = np.interp(1, ntestpos, Vlinpos)
    x_intercept_neg = Vlinneg[np.argmin(np.abs(ntestneg - (-1)))]
    
    x3 = [x_intercept_pos, x_intercept_pos,x_intercept_neg, x_intercept_neg]
    y3 = [1, 0, 0, -1]
    
    v11 = np.linspace(x_intercept_pos,100,50)
    v22 = np.linspace(x_intercept_neg,80,50)
    n11 = CLmaxpos*0.5*rho*v11**2*s/W
    n22 = CLmaxneg*0.5*rho*v22**2*s/W
    
    x4 = np.linspace(0, 140, 100)
    y4 = np.linspace(1, -3, 100)
    
    x5 = np.linspace(0, 180, 100)
    y5 = np.linspace(1, -1.06, 100)
    
    x6 = np.linspace(140, 180, 100)
    y6 = np.linspace(-3, -1.06, 100)
    
    x7 = np.linspace(0, 180, 100)
    y7 = np.linspace(0, 0, 100)
    
    plt.plot(x2, y2, 'k--', Vlinpos, ntestpos, 'k--', Vlinneg, ntestneg, 'k--', x5, -y5 + 2, 'y--', x4, -y4 + 2, 'g--',x6, -y6+2, '--g',x7, y7,'k')
    
    plt.plot(x4, y4, 'g--', label='Rajada de Cruzeiro')
    plt.plot(x5, y5, 'y--', label='Rajada de Mergulho')
    
    plt.plot(x3, y3, '-r', v11, n11, '-r', v22, n22, '-r', linewidth=2)
    
    plt.plot(x1, y1, 'r-', label='Envelope de Voo', linewidth=2)
    
    plt.xlabel('Velocidade (m/s)')
    plt.ylabel('Fator de Carga')
    
    plt.text(x1[0],y1[0]+0.2, 'PHAA',ha='center', va='bottom', fontsize=12, fontweight='bold')
    plt.text(x1[1],y1[1]+0.2, 'PLAA',ha='center', va='bottom', fontsize=12, fontweight='bold')
    plt.text(x1[2],y1[2]-0.8, 'NIAA',ha='center', va='bottom', fontsize=12, fontweight='bold')
    plt.text(x1[3],y1[3]-0.8, 'NLAA',ha='center', va='bottom', fontsize=12, fontweight='bold')
    plt.text(x1[4],y1[4]-0.8, 'NHAA',ha='center', va='bottom', fontsize=12, fontweight='bold')
    plt.ylim(-4, 9) 
    plt.xlim(0, 190) 
    
    plt.legend()
    
    plt.show()
