import React, {useState} from 'react';
import { StyleSheet, Text, View, TextInput, Platform, FlatList, Pressable, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'

export default function App() {
  const [text, setText] = useState('')
  const [todos, setTodos] = useState([])
  const [date, setDate] = useState(new Date()) // 현재 날짜 기초값
  const [showPicker, setShowPicker] = useState(false) // 피터보여주기
  const [photo, setPhoto] = useState(null) // 사진

  // 날짜 형식 만들기
  const formatDate = (d) => {
    const y = d.getFullYear() // 연도
    const m = String(d.getMonth() + 1).padStart(2, '0') // 달
    const day = String(d.getDate()).padStart(2, '0') // 일
    return `${y}-${m}-${day}` // 날짜 형식 맞추어서 리턴
  }

  // 추가 버튼 구현
  const addTodo = () => {
    if(!text.trim()) return

    const newTodo = {
      id : Date.now().toString(),
      title : text.trim(),
      date : formatDate(date),
      photos : photo,
    }
    setTodos([newTodo, ...todos])
    setText('')
    setPhoto(null)
  }

  // 삭제버튼
  const removeTode = (id) => {
    setTodos(todos.filter((item) => item.id !== id))
  }

  // 날짜 변경시 이벤트 함수
  const changeDate = (e, chDate) =>{
    if(Platform.OS === 'android'){
      setShowPicker(false)
    }
    if(chDate){
      setDate(chDate)
    }
  }

  // 카메라와 갤러리
  const getPhoto = async () => {
    const {status} = await ImagePicker.requestCameraPermissionsAsync()
    if(status !== 'granted'){
      alert('카메라 권한이 필요합니다')
      return
    }

    // 카메라로 찍은 결과물 보이기
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    })

    if(result.canceled) return

    const uri = result.assets[0].uri
    setPhoto(uri)
  }

  // 갤리러에서 사진 선택
  const getGallery = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if(status !== 'granted'){
      alert('갤러리 권한이 필요합니다')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    })

    if(result.canceled) return

    const uri = result.assets[0].uri
    setPhoto(uri)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      <View style={styles.inputR}>

        {/* 할일 입력상자 */}
        <TextInput style={styles.in} placeholder='할일을 입력하세요' value={text} onChangeText={setText} />

        {/* 날짜 버튼 만들기 */}
        <Pressable style={styles.date} onPress={() => setShowPicker(true)}>
          <Text>{formatDate(date)}</Text>
        </Pressable>


      {/* 추가버튼 만들기 */}
        <Pressable style={styles.addBox} onPress={addTodo}>
          <Text style={styles.add}>추가</Text>
        </Pressable>
      </View>

      {
        //showpicker가 참(true)값이면 데이트피커를 호출해서 보여주기
          showPicker && (
            <DateTimePicker 
              value={date} mode='date' display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={changeDate}
            />
          )
        }

      {/* 사진관련 버튼*/}
        <View style={styles.photoBtn}>
          <Pressable style={styles.camera} onPress={getPhoto}>
            <Text>카메라</Text>
          </Pressable>
          <Pressable style={styles.gellery} onPress={getGallery}>
            <Text>갤러리</Text>
          </Pressable>
        </View>

        <View style={styles.previewBox}>
          {
            photo && (
              <Image source={{uri : photo}} style={styles.photoImage}/>
            )
          }
        </View>

      {/* 할일 목록 리스트  */}
      <FlatList data={todos} keyExtractor={ (item) => item.id }
        ListEmptyComponent={ // 텅 비어있을 때
          <Text>할일이 없어요</Text>
        }
        renderItem={ ({item, idx}) => (
          <Pressable style={styles.box} onLongPress={() => removeTode(item.id)}> 
            <View>
              <Image source={{uri : item.photos}} style={styles.photoImages}/>
            </View>
            <Text style={styles.id}>{idx}</Text>
            <Text>{item.title}</Text>
            <Text>{item.date}</Text>
            <Text style={styles.delbtn}>길게 눌러서 삭제</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
  }, 
  inputR: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  in: {
    width: 150,
    borderWidth: 1,
    borderColor: 'lightgray',
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
  },
  addBox: {
    width: 50,
    height: 40,
    backgroundColor: 'royalblue',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  add: {
    color: 'white',
    fontSize: 15,
  },
  box: {
    marginBottom: 10,
  },
  id: {
    marginTop: 10,
    marginBottom: 10,
  },
  delbtn: {
    width: 'auto',
    padding: 8,
    backgroundColor: 'lightgray',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  date: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  photoImage: {
    width: 100, height: 80,
    borderRadius: 10,
    marginBottom: 10,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  camera: {
    padding: 10,
    backgroundColor: 'lavender',
    borderRadius: 10,
  }, 
  gellery: {
    padding: 10,
    backgroundColor: 'skyblue',
    borderRadius: 10,
  },
  photoImages: {
    width: 80, height: 60,
    borderRadius: 10,
  }
});
