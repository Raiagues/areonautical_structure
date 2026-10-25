# -*- coding: utf-8 -*-
"""
Created on Fri Jun  2 20:27:14 2023

@author: Emilly Raiane
"""
import RESULTADOS
import PARAMETROS
import numpy as np
import matplotlib.pyplot as plt


def sigma_x(y, z, E):
  My, Mz = RESULTADOS.MY, RESULTADOS.MZ
  E0 = PARAMETROS.MODULO_ELASTICIDADE_1
  Iyy_pond, Izz_pond = RESULTADOS.IYY_POND, RESULTADOS.IZZ_POND

  tensao = (E/E0)*((-y*Mz[0]/Izz_pond)+(z*My[0]*Iyy_pond))
  
  return tensao
def dist_tensao():
  E1, E2 = PARAMETROS.MODULO_ELASTICIDADE_1, PARAMETROS.MODULO_ELASTICIDADE_2
  t1, t2, t3, c, h = PARAMETROS.ESP_1, PARAMETROS.ESP_2, PARAMETROS.ESP_3, PARAMETROS.DIM_CORDA, PARAMETROS.DIM_H
  x, y = RESULTADOS.Y0_POND, RESULTADOS.Z0_POND
  alpha = RESULTADOS.ANG_NEUT
  test = PARAMETROS.ALPHA 
  angulo_rad = np.radians(alpha+90)

  b1_0 = 0-x; b1_1 = t2+c-x; h1_0 = h-y; h1_1 = h+t1-y
  b2_0 = 0-x; b2_1 = t2+c-x; h2_0 = 0-y; h2_1 = t1-y
  b3_0 = 0-x; b3_1 = t2-x; h3_0 = t1-y; h3_1 = h-y
  b4_0 = c-x; b4_1 = t2+c-x; h4_0 = t1-y; h4_1 = h-y
  b5_0 = c/3-x; b5_1 = c/3+t3 - x; h5_0 = t1-y; h5_1 = h-y
  b6_0 = 2*c/3-x; b6_1 = 2*c/3+t3 - x; h6_0 = t1-y; h6_1 = h-y

  x1 = np.linspace(b1_0,b1_1,50)
  y1 = np.linspace(h1_0,h1_1,50)
  x2 = np.linspace(b2_0,b2_1,50)
  y2 = np.linspace(h2_0,h2_1,50)
  x3 = np.linspace(b3_0,b3_1,50)
  y3 = np.linspace(h3_0,h3_1,50)
  x4 = np.linspace(b4_0,b4_1,50)
  y4 = np.linspace(h4_0,h4_1,50)
  x5 = np.linspace(b5_0,b5_1,50)
  y5 = np.linspace(h5_0,h5_1,50)
  x6 = np.linspace(b6_0,b6_1,50)
  y6 = np.linspace(h6_0,h6_1,50)

  xx1, yy1 = np.meshgrid(x1,y1)
  xx2, yy2 = np.meshgrid(x2,y2)
  xx3, yy3 = np.meshgrid(x3,y3)
  xx4, yy4 = np.meshgrid(x4,y4)
  xx5, yy5 = np.meshgrid(x5,y5)
  xx6, yy6 = np.meshgrid(x6,y6)

  valores1 = sigma_x(xx1,yy1,E1)
  valores2 = sigma_x(xx2,yy2,E1)
  valores3 = sigma_x(xx3,yy3,E2)
  valores4 = sigma_x(xx4,yy4,E2)
  valores5 = sigma_x(xx5,yy5,E2)
  valores6 = sigma_x(xx6,yy6,E2)

  lista_valores = [valores1, valores2, valores3, valores4, valores5, valores6]
  array_valores = np.array(lista_valores)

  v_max = np.amax(array_valores[np.logical_and(array_valores != 0, array_valores != np.inf)])
  v_min = np.amin(array_valores[np.logical_and(array_valores != 0, array_valores != np.inf)])

  x10 = [b1_0, b1_1, b1_1, b1_0, b1_0]
  y10 = [h1_0, h1_0, h1_1, h1_1, h1_0]
  x20 = [b2_0, b2_1, b2_1, b2_0, b2_0]
  y20 = [h2_0, h2_0, h2_1, h2_1, h2_0]
  x30 = [b3_0, b3_1, b3_1, b3_0, b3_0]
  y30 = [h3_0, h3_0, h3_1, h3_1, h3_0]
  x40 = [b4_0, b4_1, b4_1, b4_0, b4_0]
  y40 = [h4_0, h4_0, h4_1, h4_1, h4_0]
  x50 = [b5_0, b5_1, b5_1, b5_0, b5_0]
  y50 = [h5_0, h5_0, h5_1, h5_1, h5_0]
  x60 = [b6_0, b6_1, b6_1, b6_0, b6_0]
  y60 = [h6_0, h6_0, h6_1, h6_1, h6_0]
  theta = np.linspace(0, 2 * np.pi, 100)
  r1 = 0.05  
  x1_circulo1 = r1 * np.cos(theta) + b1_0+t2/2
  y1_circulo1 = r1 * np.sin(theta) + h1_1-t1/2
  x2_circulo1 = r1 * np.cos(theta) + b1_1-t2/2
  y2_circulo1 = r1 * np.sin(theta) + h1_1-t1/2
  x3_circulo1 = r1 * np.cos(theta) + b4_0+t2/2
  y3_circulo1 = r1 * np.sin(theta) + h4_0-t1/2
  x4_circulo1 = r1 * np.cos(theta) + b1_0+t2/2
  y4_circulo1 = r1 * np.sin(theta) + h4_0-t1/2

  x1_circulo2 = r1 * np.cos(theta) + b1_0+t2/2
  y1_circulo2 = r1 * np.sin(theta) + h1_1-3*t1/2
  x2_circulo2 = r1 * np.cos(theta) + b1_1-t2/2
  y2_circulo2 = r1 * np.sin(theta) + h1_1-3*t1/2
  x3_circulo2 = r1 * np.cos(theta) + b4_0+t2/2
  y3_circulo2 = r1 * np.sin(theta) + h4_0+t1/2
  x4_circulo2 = r1 * np.cos(theta) + b1_0+t2/2
  y4_circulo2 = r1 * np.sin(theta) + h4_0+t1/2

  fig, ax = plt.subplots(figsize=(12,4), ncols=2)  

  ax[0].fill(x10, y10, color='blue', alpha=0.5)
  ax[0].fill(x30, y30, color='green', alpha=0.5)

  comprimento = c/2+t2/2
  x_inicial = -comprimento
  x_final = +comprimento
  y_inicial = -(comprimento)*np.tan(angulo_rad)
  y_final = +(comprimento)*np.tan(angulo_rad)
  ax[0].plot([x_inicial, x_final],[y_inicial, y_final],'r--', linewidth=0.8)
  ax[0].plot(0, 0,'ro')

  ax[0].fill(x20, y20, color='blue', alpha=0.5)
  ax[0].fill(x40, y40, color='green', alpha=0.5)
  ax[0].fill(x50, y50, color='green', alpha=0.5)
  ax[0].fill(x60, y60, color='green', alpha=0.5)
  ax[0].plot(x10, y10, color='black', linewidth=0.8)
  ax[0].plot(x20, y20, color='black', linewidth=0.8)
  ax[0].plot(x30, y30, color='black', linewidth=0.8)
  ax[0].plot(x40, y40, color='black', linewidth=0.8)
  ax[0].plot(x50, y50, color='black', linewidth=0.8)
  ax[0].plot(x60, y60, color='black', linewidth=0.8)

  legend = ax[0].legend(['Alumínio 7075-T6', 'Titânio Ti-6Al-4V', 'Eixo Neutro', 'Centróide'], fontsize=8)
  ax[0].add_artist(legend)

  ax[0].set_title('Seção Transversal da Estrutura Alar', fontsize=8)
  ax[0].axis('equal')
  ax[0].set_xlabel('Corda (m)')
  ax[0].set_ylabel('Altura da Caixa (m)')
  ax[0].set_xlim(-c/2-t2, c/2+t2)
  ax[0].set_ylim(-h/2-t1, h/2+t1)

  pot = ax[1].contourf(xx1,yy1,valores1, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax[1].contourf(xx2,yy2,valores2, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax[1].contourf(xx3,yy3,valores3, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax[1].contourf(xx4,yy4,valores4, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax[1].contourf(xx5,yy5,valores5, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax[1].contourf(xx6,yy6,valores6, cmap='jet', levels=30, vmax=v_max, vmin=v_min)

  sm = plt.cm.ScalarMappable(cmap='jet', norm=plt.Normalize(vmin=v_min/1e6, vmax=v_max/1e6))
  sm.set_array([])  
  cbar = fig.colorbar(sm, ax=ax[1])
  cbar.set_label(r'Distribuição da Tensão $\sigma_x (MPa)$', fontsize=10)
  ax[1].set_title('Gradiente de Tensão Sobre a Seção Transversal', fontsize=8)
  ax[1].axis('equal')
  ax[1].set_xlabel('Corda (m)')

  fig1, ax1 = plt.subplots(figsize=(12,4), ncols=2)  

  pot = ax1[0].contourf(xx1,yy1,valores1, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax1[0].contourf(xx2,yy2,valores2, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax1[0].contourf(xx3,yy3,valores3, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax1[0].contourf(xx4,yy4,valores4, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax1[0].contourf(xx5,yy5,valores5, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax1[0].contourf(xx6,yy6,valores6, alpha=0.8, cmap='jet', levels=30, vmax=v_max, vmin=v_min)

  legend_circulos = ax1[0].legend([f'(1) {(valores1[0,0]/1e6):.4} MPa', f'(2) {(valores1[0,-1]/1e6):.4} MPa', f'(3) {(valores2[-1,0]/1e6):.4} MPa', f'(4) {(valores2[-1,-1]/1e6):.4} MPa'], loc='upper right',handlelength=0, fontsize=8)
  ax1[0].add_artist(legend_circulos)

  ax1[0].plot([x_inicial, x_final],[y_inicial, y_final],'r--', linewidth=0.8)
  ax1[0].plot(0, 0,'ro')

  ax1[0].plot(x1_circulo1, y1_circulo1, color='white', linewidth=1.5)
  ax1[0].plot(x2_circulo1, y2_circulo1, color='white', linewidth=1.5)
  ax1[0].plot(x3_circulo1, y3_circulo1, color='white', linewidth=1.5)
  ax1[0].plot(x4_circulo1, y4_circulo1, color='white', linewidth=1.5)
  ax1[0].text(b1_0+t2/2, h1_1-t1/2, '1', color='white', ha='center', va='center')
  ax1[0].text(b1_1-t2/2, h1_1-t1/2, '2', color='white', ha='center', va='center')
  ax1[0].text(b4_0+t2/2, h4_0-t1/2, '4', color='white', ha='center', va='center')
  ax1[0].text(b1_0+t2/2, h4_0-t1/2, '3', color='white', ha='center', va='center')

  sm = plt.cm.ScalarMappable(cmap='jet', norm=plt.Normalize(vmin=v_min/1e6, vmax=v_max/1e6))
  sm.set_array([])  
  cbar = fig1.colorbar(sm, ax=ax1[0])
  cbar.set_label(r'Distribuição da Tensão $\sigma_x (MPa)$', fontsize=10)
    
  ax1[0].set_title('Pontos Críticos para Vigas Horizontais', fontsize=8)
  ax1[0].axis('equal')
  ax1[0].set_xlabel('Corda (m)')
  ax1[0].set_xlim(-c/2-t2, c/2+t2)
  ax1[0].set_ylim(-h/2-t1, h/2+t1)

  pot = ax1[1].contourf(xx1,yy1,valores1, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax1[1].contourf(xx2,yy2,valores2, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax1[1].contourf(xx3,yy3,valores3, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax1[1].contourf(xx4,yy4,valores4, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax1[1].contourf(xx5,yy5,valores5, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax1[1].contourf(xx6,yy6,valores6, cmap='jet', levels=30, vmax=v_max, vmin=v_min)

  legend_circulos = ax1[1].legend([f'(5) {(valores3[0,0]/1e6):.4} MPa', f'(6) {(valores3[0,-1]/1e6):.4} MPa', f'(7) {(valores4[-1,0]/1e6):.4} MPa', f'(8) {(valores4[-1,-1]/1e6):.4} MPa'], loc='upper right',handlelength=0, fontsize=8)
  ax1[1].add_artist(legend_circulos)

  ax1[1].plot([x_inicial, x_final],[y_inicial, y_final],'r--', linewidth=0.8)
  ax1[1].plot(0, 0,'ro')

  ax1[1].plot(x1_circulo2, y1_circulo2, color='white', linewidth=1.5)
  ax1[1].plot(x2_circulo2, y2_circulo2, color='white', linewidth=1.5)
  ax1[1].plot(x3_circulo2, y3_circulo2, color='white', linewidth=1.5)
  ax1[1].plot(x4_circulo2, y4_circulo2, color='white', linewidth=1.5)

  ax1[1].text(b1_0+t2/2, h1_1-3*t1/2, '5', color='white', ha='center', va='center')
  ax1[1].text(b1_1-t2/2, h1_1-3*t1/2, '6', color='white', ha='center', va='center')
  ax1[1].text(b4_0+t2/2, h4_0+t1/2, '8', color='white', ha='center', va='center')
  ax1[1].text(b1_0+t2/2, h4_0+t1/2, '7', color='white', ha='center', va='center')

  sm = plt.cm.ScalarMappable(cmap='jet', norm=plt.Normalize(vmin=v_min/1e6, vmax=v_max/1e6))
  sm.set_array([])  
  cbar = fig1.colorbar(sm, ax=ax1[1])
  cbar.set_label(r'Distribuição da Tensão $\sigma_x (MPa)$', fontsize=10)
    
  ax1[1].set_title('Pontos Críticos para Vigas Verticais', fontsize=8)
  ax1[1].axis('equal')
  ax1[1].set_xlabel('Corda (m)')
  ax1[1].set_xlim(-c/2-t2, c/2+t2)
  ax1[1].set_ylim(-h/2-t1, h/2+t1)

  plt.show()
  
  return v_max, v_min