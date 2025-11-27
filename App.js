import React, {useState, useRef} from 'react'
import { StyleSheet, Text, View, TextInput, Platform, 
          FlatList, Pressable, Image, Animated
        } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'

export default function App() {
  const [text, setText] = useState('')
  const [todos, setTodos] = useState([])
  const [date, setDate] = useState(new Date()) // 현재 날짜 기초값
  const [showPicker, setShowPicker] = useState(false) // 피터보여주기
  const [photo, setPhoto] = useState(null) // 사진
  const [editing, setEditing] = useState(null)

  const topAnim = useRef(new Animated.Value(1)).current

  const runAni = () => {
    topAnim.setValue(0.9)
    Animated.timing(topAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }

  // 날짜 형식 만들기
  const formatDate = (d) => {
    const y = d.getFullYear() // 연도
    const m = String(d.getMonth() + 1).padStart(2, '0') // 달
    const day = String(d.getDate()).padStart(2, '0') // 일
    return `${y}-${m}-${day}` // 날짜 형식 맞추어서 리턴
  }

  // 추가/ 수정 버튼 구현
  const addTodo = () => {
    if (!text.trim()) return;

    if (editing) {
      setTodos(todos.map(to =>
        to.id === editing
          ? { ...to, title: text.trim(), date: formatDate(date), photos: photo }
          : to
      ))
      setEditing(null);
    } else {
      const newTodo = {
        id: Date.now().toString(),
        title: text.trim(),
        date: formatDate(date),
        photos: photo,
        shake: new Animated.Value(0),  // 삭제 버튼 흔들림 애니메이션
      }
      setTodos([newTodo, ...todos]);
    }

    setText("");
    setPhoto(null);
  }

  // 수정 버튼
  const startEdit = (item) => {
    runAni() // 버튼 누를 때 애니메이션 실행
    setEditing(item.id)
    setText(item.title)
    setDate(new Date(item.date))
    setPhoto(item.photos)
  }

  // 삭제 + 흔들기 애니메이션
  const shakeAndDelete = (item) => {
    if (!item.shake) item.shake = new Animated.Value(0)
    Animated.sequence([
      Animated.timing(item.shake, { 
        toValue: 10, 
        duration: 50, 
        useNativeDriver: true 
      }),
      Animated.timing(
        item.shake, 
        { 
          toValue: -10, 
          duration: 50, 
          useNativeDriver: true 
        }),
      Animated.timing(
        item.shake, 
        { 
          toValue: 0, 
          duration: 50, 
          useNativeDriver: true 
        }),
    ]).start(() => {
      setTodos(prev => prev.filter(t => t.id !== item.id))
    })
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

      <Animated.View style={{ transform: [{ scale: topAnim }] }}>
        
        {/* 입력창 + 날짜 버튼 */}
        <View style={styles.inputR}>
          <TextInput
            style={styles.in} placeholder='할일을 입력하세요'
            value={text} onChangeText={setText}
          />
          <Pressable style={styles.date} onPress={() => setShowPicker(true)}>
            <Text>{formatDate(date)}</Text>
          </Pressable>
        </View>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={changeDate}
          />
        )}

        {/* 카메라 & 갤러리 버튼 */}
        <View style={styles.photoBtn}>
          <Pressable style={styles.camera} onPress={getPhoto}>
            <Text style={styles.cameraText}>카메라</Text>
          </Pressable>

          <Pressable style={styles.gellery} onPress={getGallery}>
            <Text style={styles.gelleryText}>갤러리</Text>
          </Pressable>
        </View>

        {/* 미리보기 */}
        <View style={styles.previewBox}>
          {photo && (
            <Image source={{ uri: photo }} style={styles.photoImage} />
          )}
        </View>

        {/* 추가 / 저장 */}
        <Pressable style={styles.addBox} onPress={addTodo}>
          <Text style={styles.add}>{editing ? "저장" : "추가"}</Text>
        </Pressable>

      </Animated.View>

      {/* 리스트 */}
      <FlatList
        style={styles.list}
        data={todos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ textAlign: 'center' }}>할일이 없어요</Text>}
        renderItem={({ item, idx }) => (
          <Pressable onLongPress={() => shakeAndDelete(item)}>
            <Animated.View
              style={[
                styles.box,
                { transform: [{ translateX: item.shake }] }
              ]}
            >
              <Image source={{ uri: item.photos }} style={styles.photoImages} />

              <View style={styles.inbox}>
                <Text>{idx}</Text>
                <Text style={styles.listTitle}>{item.title}</Text>
                <Text style={styles.listdate}>{item.date}</Text>

                <View style={styles.btnRow}>
                  <Text style={styles.delbtn}>길게 누르면 삭제</Text>
                  <Pressable style={styles.editbtn} onPress={() => startEdit(item)}>
                    <Text>수정</Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          </Pressable>
        )}
      />

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
  }, 
  // 입력창 + 날짜 버튼
  inputR: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  in: {
    width: 180,
    borderWidth: 1,
    borderColor: 'lightgray',
    padding: 12,
    borderRadius: 10,
  },
  date: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 5,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    borderColor: 'lightgray',
    color: 'lightgray',
  },

  // 카메라, 갤러리 버튼
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  camera: {
    width: 138,
    padding: 18,
    backgroundColor: 'lavender',
    borderRadius: 10,
  },
  cameraText: {
    fontSize: 18,
    textAlign:'center',
  },
  gellery: {
    width: 138,
    padding: 18,
    backgroundColor: 'skyblue',
    borderRadius: 10,
  },
  gelleryText: {
    fontSize: 18,
    textAlign:'center',
  },

  // 사진 미리보기
  previewBox: {
    width: 280, 
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 10,
    marginBottom: 20,
  },
  photoImage: {
    width: 280, 
    height: 120,
    borderRadius: 10,
  },

  // 추가 or 저장 버튼
  addBox: {
    width: 280,
    height: 40,
    backgroundColor: 'royalblue',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  add: {
    color: 'white',
    fontSize: 18,
  },

  // 리스트
  list: {
    width: 500,
    marginBottom: 5,
  },
  box: {
    width: '100%',
    height: 150,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  photoImages: {
    width: 130, height: 140,
    borderRadius: 10,
  },
  inbox: {
    marginLeft: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  id: {
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 20,
    marginBottom: 5,
  },
  listdate: {
    marginBottom: 5,
  },

  btnRow: {
    flexDirection: 'colum',
    alignItems: 'center',
    gap: 5, 
  },
  delbtn: {
    width: 150,
    padding: 8,
    backgroundColor: 'pink',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editbtn: {
    width: 150,
    padding: 8,
    backgroundColor: 'lavender',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  }

});
