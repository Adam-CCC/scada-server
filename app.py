from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np

app = Flask(__name__)

# Загрузка модели
model = load_model('my_model.h5')

# Имена классов
class_names = {
    1: "Перевод одиночной стрелки",
    2: "Перевод спаренной стрелки",
    3: "Работа одиночной стрелки на фрикцию",
    4: "Работа первой спаренной стрелки на фрикцию",
    5: "Работа второй спаренной стрелки на фрикцию",
    6: "Короткое замыкание якоря электродвигателя",
    7: "Искрение щеток электродвигателя",
    8: "Загрязнение коллектора электродвигателя",
    9: "Загрязнение башмаков стрелочного перевода",
    10: "Пружинность остряков",
    11: "Завышение времени перевода",
    12: "Отклонение тока перевода",
    13: "Отклонение тока при работе на фрикцию",
    14: "Неисправность редуктора",
    15: "Неисправность автопереключателя",
    16: "Люфты в соединениях тяг",
    17: "Неисправность пусковой цепи стрелки"
}

# Функция для форматирования предсказаний
def format_predictions(predictions, thresholds):
    formatted_predictions = []
    for i, prob in enumerate(predictions):
        prob = float(prob)  # Преобразование в тип float
        if prob > thresholds[0]:
            formatted_predictions.append((class_names[i+1], prob, 1))  # К первой стрелке
        elif prob > thresholds[1]:
            formatted_predictions.append((class_names[i+1], prob, 2))  # Ко второй стрелке
        else:
            formatted_predictions.append((class_names[i+1], prob, 0))  # Не имеет значения
    return formatted_predictions

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    new_data = np.array(data['series'])

    new_data = np.expand_dims(new_data, axis=0)
    new_data = pad_sequences(new_data, maxlen=model.input_shape[1], padding='post', dtype='float32')
    new_data = np.expand_dims(new_data, axis=2)

    predictions = model.predict(new_data)[0]
    thresholds = [0.5, 0.3]  # Пороговые значения для классификации
    formatted_predictions = format_predictions(predictions, thresholds)

    return jsonify(formatted_predictions)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
