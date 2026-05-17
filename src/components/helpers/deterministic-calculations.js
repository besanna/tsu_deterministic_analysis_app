/**
 * Утилиты для детерминационного анализа данных
 * Содержит всю логику расчетов частот, интенсивности и ёмкости детерминации
 */

/**
 * Рассчитывает частоты для отдельных категорий
 * @param {Array} data - массив данных
 * @param {Array} columns - массив названий столбцов
 * @returns {Object} объект с частотами для каждой категории
 */
export const calculateSingleFrequencies = (data, columns) => {
  const totalRows = data.length;
  const singleFreq = {};

  columns.forEach(column => {
    const columnData = data.map(row => row[column]);
    const uniqueValues = [...new Set(columnData)].filter(val => val && val.trim() !== '');
    
    singleFreq[column] = {};
    uniqueValues.forEach(value => {
      const count = columnData.filter(val => val === value).length;
      singleFreq[column][value] = {
        count,
        frequency: count / totalRows
      };
    });
  });

  return singleFreq;
};

/**
 * Рассчитывает парные частоты для всех комбинаций категорий
 * @param {Array} data - массив данных
 * @param {Array} columns - массив названий столбцов
 * @returns {Object} объект с парными частотами
 */
export const calculatePairFrequencies = (data, columns) => {
  const totalRows = data.length;
  const pairFreq = {};

  // Рассчитываем частоты для всех пар категорий
  for (let i = 0; i < columns.length; i++) {
    for (let j = i + 1; j < columns.length; j++) {
      const col1 = columns[i];
      const col2 = columns[j];
      const col1Data = data.map(row => row[col1]);
      const col2Data = data.map(row => row[col2]);
      
      const unique1 = [...new Set(col1Data)].filter(val => val && val.trim() !== '');
      const unique2 = [...new Set(col2Data)].filter(val => val && val.trim() !== '');
      
      pairFreq[`${col1} & ${col2}`] = {};
      
      unique1.forEach(val1 => {
        pairFreq[`${col1} & ${col2}`][val1] = {};
        unique2.forEach(val2 => {
          const count = data.filter(row => row[col1] === val1 && row[col2] === val2).length;
          pairFreq[`${col1} & ${col2}`][val1][val2] = {
            count,
            frequency: count / totalRows
          };
        });
      });
    }
  }

  return pairFreq;
};

/**
 * Рассчитывает интенсивность детерминации для парных комбинаций
 * @param {Object} singleFreq - одиночные частоты
 * @param {Object} pairFreq - парные частоты
 * @returns {Object} объект с интенсивностью детерминации
 */
export const calculateIntensity = (singleFreq, pairFreq) => {
  const intensity = {};
  
  Object.entries(pairFreq).forEach(([pairName, pairData]) => {
    const [col1, col2] = pairName.split(' & ');
    intensity[pairName] = {};
    
    Object.entries(pairData).forEach(([value1, value2Data]) => {
      intensity[pairName][value1] = {};
      Object.entries(value2Data).forEach(([value2, data]) => {
        const singleFreq1 = singleFreq[col1]?.[value1];
        const intensityValue = singleFreq1 ? data.frequency / singleFreq1.frequency : 0;
        
        intensity[pairName][value1][value2] = {
          count: data.count,
          frequency: data.frequency,
          intensity: intensityValue
        };
      });
    });
  });
  
  return intensity;
};

/**
 * Рассчитывает ёмкость детерминации для парных комбинаций
 * @param {Object} singleFreq - одиночные частоты
 * @param {Object} pairFreq - парные частоты
 * @returns {Object} объект с ёмкостью детерминации
 */
export const calculateCapacity = (singleFreq, pairFreq) => {
  const capacity = {};
  
  Object.entries(pairFreq).forEach(([pairName, pairData]) => {
    const [col1, col2] = pairName.split(' & ');
    capacity[pairName] = {};
    
    Object.entries(pairData).forEach(([value1, value2Data]) => {
      capacity[pairName][value1] = {};
      Object.entries(value2Data).forEach(([value2, data]) => {
        const singleFreq2 = singleFreq[col2]?.[value2];
        const capacityValue = singleFreq2 ? data.frequency / singleFreq2.frequency : 0;
        
        capacity[pairName][value1][value2] = {
          count: data.count,
          frequency: data.frequency,
          capacity: capacityValue
        };
      });
    });
  });
  
  return capacity;
};

/**
 * Рассчитывает фокусный анализ для выбранной категории и значения
 * @param {Object} singleFreq - одиночные частоты
 * @param {Object} pairFreq - парные частоты
 * @param {string} focusCategory - выбранная категория
 * @param {string} focusValue - выбранное значение
 * @returns {Array} массив результатов фокусного анализа
 */
export const calculateFocusAnalysis = (singleFreq, pairFreq, focusCategory, focusValue) => {
  const analysisData = [];
  
  // Находим все пары, которые включают выбранную категорию
  Object.entries(pairFreq).forEach(([pairName, pairData]) => {
    const [col1, col2] = pairName.split(' & ');
    
    // Проверяем, есть ли выбранная категория в этой паре
    if (col1 === focusCategory || col2 === focusCategory) {
      Object.entries(pairData).forEach(([value1, value2Data]) => {
        Object.entries(value2Data).forEach(([value2, data]) => {
          // Проверяем, является ли это выбранным значением
          if ((col1 === focusCategory && value1 === focusValue) || 
              (col2 === focusCategory && value2 === focusValue)) {
            
            const otherCategory = col1 === focusCategory ? col2 : col1;
            const otherValue = col1 === focusCategory ? value2 : value1;
            const singleFreqOther = singleFreq[otherCategory]?.[otherValue];
            const singleFreqFocus = singleFreq[focusCategory]?.[focusValue];
            
            const intensity = singleFreqOther ? data.frequency / singleFreqOther.frequency : 0;
            const capacity = singleFreqFocus ? data.frequency / singleFreqFocus.frequency : 0;
            
            analysisData.push({
              otherCategory,
              otherValue,
              count: data.count,
              frequency: data.frequency,
              intensity,
              capacity,
              isFocusCategory: col1 === focusCategory
            });
          }
        });
      });
    }
  });
  
  // Сортируем по интенсивности (насколько выбранное значение определяет другое значение)
  analysisData.sort((a, b) => b.intensity - a.intensity);
  
  return analysisData;
};

/**
 * Извлекает уникальные значения из данных
 * @param {Array} data - массив данных
 * @param {Array} columns - массив названий столбцов
 * @returns {Object} объект с уникальными значениями для каждой категории
 */
export const extractUniqueValues = (data, columns) => {
  const uniqueValues = {};
  
  columns.forEach(column => {
    const columnData = data.map(row => row[column]);
    uniqueValues[column] = [...new Set(columnData)].filter(val => val && val.trim() !== '');
  });
  
  return uniqueValues;
};

/**
 * Основная функция для расчета всех частот
 * @param {Array} data - массив данных
 * @param {Array} columns - массив названий столбцов
 * @returns {Object} объект с результатами всех расчетов
 */
export const calculateAllFrequencies = (data, columns) => {
  const singleFreq = calculateSingleFrequencies(data, columns);
  const pairFreq = calculatePairFrequencies(data, columns);
  
  return {
    singleFreq,
    pairFreq
  };
};

/**
 * Рассчитывает существенность для тройных комбинаций
 * @param {Array} data - массив данных
 * @param {Object} singleFreq - одиночные частоты
 * @param {Object} pairFreq - парные частоты
 * @param {string} focusCategory - выбранная категория
 * @param {string} focusValue - выбранное значение
 * @returns {Array} массив результатов анализа существенности
 */
export const calculateSignificanceAnalysis = (data, singleFreq, pairFreq, focusCategory, focusValue) => {
  const results = [];
  const totalRows = data.length;
  
  // Находим все пары категорий, которые НЕ включают выбранную категорию
  const otherCategories = Object.keys(singleFreq).filter(cat => cat !== focusCategory);
  
  // Для каждой пары других категорий
  for (let i = 0; i < otherCategories.length; i++) {
    for (let j = i + 1; j < otherCategories.length; j++) {
      const cat1 = otherCategories[i];
      const cat2 = otherCategories[j];
      
      // Получаем уникальные значения для каждой категории
      const values1 = Object.keys(singleFreq[cat1]);
      const values2 = Object.keys(singleFreq[cat2]);
      
      // Для каждой комбинации значений из двух категорий
      values1.forEach(val1 => {
        values2.forEach(val2 => {
          // Рассчитываем интенсивность для тройной комбинации
          const tripleCount = data.filter(row => 
            row[cat1] === val1 && 
            row[cat2] === val2 && 
            row[focusCategory] === focusValue
          ).length;
          
          const pairCount = data.filter(row => 
            row[cat1] === val1 && 
            row[cat2] === val2
          ).length;
          
          const focusCount = data.filter(row => 
            row[focusCategory] === focusValue
          ).length;
          
          if (pairCount > 0 && focusCount > 0) {
            // Интенсивность тройной комбинации
            const tripleIntensity = tripleCount / pairCount;
            
            // Интенсивность для каждой категории отдельно
            const singleCount1 = data.filter(row => 
              row[cat1] === val1 && 
              row[focusCategory] === focusValue
            ).length;
            const singleCount2 = data.filter(row => 
              row[cat2] === val2 && 
              row[focusCategory] === focusValue
            ).length;
            
            const singleFreq1 = singleFreq[cat1][val1];
            const singleFreq2 = singleFreq[cat2][val2];
            
            const singleIntensity1 = singleFreq1 ? singleCount1 / singleFreq1.count : 0;
            const singleIntensity2 = singleFreq2 ? singleCount2 / singleFreq2.count : 0;
            
            // Рассчитываем существенность
            const significance1 = tripleIntensity - singleIntensity1;
            const significance2 = tripleIntensity - singleIntensity2;
            
            // Ёмкость тройной комбинации
            const tripleCapacity = tripleCount / focusCount;
            
            results.push({
              category1: cat1,
              value1: val1,
              category2: cat2,
              value2: val2,
              tripleCount,
              pairCount,
              focusCount,
              tripleIntensity,
              tripleCapacity,
              singleIntensity1,
              singleIntensity2,
              significance1,
              significance2,
              significance1Type: significance1 > 0 ? 'positive' : significance1 < 0 ? 'negative' : 'neutral',
              significance2Type: significance2 > 0 ? 'positive' : significance2 < 0 ? 'negative' : 'neutral'
            });
          }
        });
      });
    }
  }
  
  // Сортируем по убыванию интенсивности тройной комбинации
  results.sort((a, b) => b.tripleIntensity - a.tripleIntensity);
  
  return results;
};

/**
 * Проверяет валидность CSV данных
 * @param {Array} data - массив данных
 * @returns {Object} объект с результатом валидации
 */
export const validateCsvData = (data) => {
  if (!data || data.length === 0) {
    return {
      isValid: false,
      error: 'CSV файл пуст или не содержит данных'
    };
  }

  // Проверяем, что все строки имеют одинаковое количество столбцов
  const firstRowLength = Object.keys(data[0]).length;
  const invalidRows = data.filter(row => Object.keys(row).length !== firstRowLength);
  
  if (invalidRows.length > 0) {
    return {
      isValid: false,
      error: 'Не все строки имеют одинаковое количество столбцов'
    };
  }

  return {
    isValid: true,
    error: null
  };
};
