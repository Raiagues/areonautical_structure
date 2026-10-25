# -*- coding: utf-8 -*-
"""
Created on Fri Jun  2 21:26:01 2023

@author: Emilly Raiane
"""

import RESULTADOS
import PARAMETROS
import numpy as np

def angulo_eixo_neutro():
  My, Mz = PARAMETROS.MY, PARAMETROS.MZ
  Iyy_pond, Izz_pond = RESULTADOS.IYY_POND, RESULTADOS.IZZ_POND
  alpha = np.degrees(np.arctan((Mz[0]*Iyy_pond)/(My[0]*Izz_pond)))

  return alpha

